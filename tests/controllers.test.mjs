import 'reflect-metadata';
import {test} from 'node:test';
import {IncomingMessage, ServerResponse} from 'node:http';
import {Socket} from 'node:net';
import assert from 'node:assert/strict';
import {Types} from 'mongoose';
import {Application} from '../dist/application.js';
import {UserController} from '../dist/shared/modules/user/user.controller.js';
import {OfferController} from '../dist/shared/modules/offer/offer.controller.js';
import {CityController} from '../dist/shared/modules/city/city.controller.js';
import {FavouriteController} from '../dist/shared/modules/favourites/favourite.controller.js';
import {AuthService} from '../dist/shared/modules/auth/auth.service.js';
import {container} from '../dist/container.js';

test('container constructs Application and all controller dependencies', () => {
  assert.ok(container.get(Application) instanceof Application);
});

test('session tokens are hashed, expire, and can be revoked', async () => {
  let stored;
  const sessions = {
    create: async (data) => { stored = data; },
    findOne: (filter) => ({exec: async () => stored && stored.tokenHash === filter.tokenHash && stored.expiresAt > filter.expiresAt.$gt ? stored : null}),
    deleteOne: () => ({exec: async () => { stored = null; }})
  };
  const user = {_id: new Types.ObjectId()};
  const auth = new AuthService(sessions, {findById: async () => user}, {get: () => 60});
  const token = await auth.createToken(user);
  assert.equal(token.length, 64);
  assert.notEqual(stored.tokenHash, token);
  assert.equal(await auth.authenticate(token), user);
  assert.equal(await auth.authenticate('wrong'), null);
  stored.expiresAt = new Date(0);
  assert.equal(await auth.authenticate(token), null);
  await auth.revoke(token);
  assert.equal(await auth.authenticate(token), null);
});

test('HTTP routes implement users, offers, premium and favourites', async (t) => {
  const owner = {_id: new Types.ObjectId(), name: 'Anna', email: 'anna@example.com', type: 'regular', avatar: 'avatar.png', passwordHash: 'private'};
  const stranger = {...owner, _id: new Types.ObjectId()};
  let registered = false;
  let saved;
  let existing = true;
  let favourite = false;
  let patch;
  let requestedLimit;
  let requestedCity;
  let issued = false;
  const id = new Types.ObjectId();
  const view = () => ({
    _id: id, title: 'A lovely apartment', description: 'A spacious apartment in Paris',
    date: new Date('2026-10-01'), city: 'Paris', previewImage: 'preview.jpg', housingImages: Array(6).fill('room.jpg'),
    isPremium: true, isFavorite: false, rating: 0, commentCount: 0, housingType: 'apartment', roomCount: 2,
    guestCount: 3, rentPrice: 150, amenities: ['Breakfast'], coordinates: {latitude: 48.8, longitude: 2.3}, author: owner
  });
  const offers = {
    find: async (limit) => { requestedLimit = limit; return [view()]; },
    findById: async (value, userId) => existing && String(value) === String(id) ? {...view(), isFavorite: favourite && userId === String(owner._id)} : null,
    create: async (dto) => { saved = dto; return {_id: id}; },
    update: async (_id, dto) => { patch = dto; return {_id: id}; },
    delete: async () => { existing = false; return {_id: id}; },
    findPremium: async (city) => { requestedCity = city; return [view()]; }
  };
  const users = {
    findByEmail: async () => registered ? owner : null,
    create: async () => { registered = true; return owner; },
    verifyPassword: async (_email, password) => password === 'secret123' ? owner : null
  };
  const auth = {
    createToken: async () => { issued = true; return 'owner-token'; },
    authenticate: async (token) => token === 'owner-token' && issued ? owner : token === 'stranger-token' ? stranger : null,
    revoke: async () => { issued = false; }
  };
  const favourites = {
    findByUserId: async () => favourite ? [{...view(), isFavorite: true}] : [],
    create: async () => {
      if (favourite) { throw Object.assign(new Error('duplicate'), {code: 11000}); }
      favourite = true;
    },
    delete: async () => { const found = favourite; favourite = false; return found ? {} : null; }
  };
  const app = new Application(
    {info() {}}, {validate() {}, get: () => 0}, {connect: async () => {}, disconnect: async () => {}},
    new UserController(users, auth), new OfferController(offers), new CityController(offers), new FavouriteController(favourites, offers), auth
  );
  await app.init();
  t.after(() => app.close());
  const request = (path, method = 'GET', body, token) => new Promise((resolve, reject) => {
    const req = new IncomingMessage(new Socket());
    req.url = path;
    req.method = method;
    req.headers = {...(body ? {'content-type': 'application/json', 'content-length': String(Buffer.byteLength(JSON.stringify(body)))} : {}), ...(token ? {authorization: `Bearer ${token}`} : {})};
    const res = new ServerResponse(req);
    res.end = (data) => {
      resolve({status: res.statusCode, body: data ? JSON.parse(String(data)) : null});
      return res;
    };
    req.on('error', reject);
    app.expressApp.handle(req, res);
    if (body) { req.push(JSON.stringify(body)); }
    req.push(null);
  });
  const registration = {name: 'Anna', email: 'anna@example.com', password: 'secret123', userType: 'regular'};
  const createdUser = await request('/users', 'POST', registration);
  assert.equal(createdUser.status, 201);
  assert.deepEqual(Object.keys(createdUser.body).sort(), ['id', 'name', 'email', 'userType', 'avatar'].sort());
  assert.equal((await request('/users', 'POST', registration)).status, 409);
  assert.equal((await request('/users/login', 'POST', {email: registration.email, password: 'wrong'})).status, 401);
  const login = await request('/users/login', 'POST', {email: registration.email, password: 'secret123'});
  assert.equal(login.status, 200);
  const token = login.body.token;
  assert.equal((await request('/users/login')).status, 401);
  assert.equal((await request('/users/login', 'GET', undefined, token)).body.id, String(owner._id));
  assert.equal((await request('/users', 'POST', registration, token)).status, 403);
  assert.equal((await request('/offers', 'POST', {})).status, 401);
  const body = {title: 'A lovely apartment', description: 'A spacious apartment in Paris', city: 'Paris', previewImage: 'preview.jpg', images: Array(6).fill('room.jpg'), isPremium: true, type: 'apartment', roomsCount: 2, guestsCount: 3, price: 150, amenities: ['Breakfast'], location: {latitude: 48.8, longitude: 2.3}, author: String(stranger._id), rating: 5};
  const created = await request('/offers', 'POST', body, token);
  assert.equal(created.status, 201);
  assert.equal(String(saved.author), String(owner._id));
  assert.equal(saved.rentPrice, body.price);
  assert.equal(saved.rating, undefined);
  assert.equal(created.body.author.passwordHash, undefined);
  assert.equal(created.body.images.length, 6);
  const list = await request('/offers?limit=100');
  assert.equal(requestedLimit, 100);
  assert.equal(list.body[0].price, 150);
  assert.equal(list.body[0].description, undefined);
  assert.equal(list.body[0]._id, undefined);
  assert.equal((await request(`/offers/${id}`, 'GET')).status, 200);
  assert.equal((await request(`/offers/${new Types.ObjectId()}`)).status, 404);
  assert.equal((await request(`/offers/${id}`, 'PATCH', {price: 200}, 'stranger-token')).status, 403);
  assert.equal((await request(`/offers/${id}`, 'PATCH', {price: 200, author: String(stranger._id), rating: 5}, token)).status, 200);
  assert.deepEqual(patch, {rentPrice: 200});
  assert.equal((await request('/cities/Paris/premium')).status, 200);
  assert.equal(requestedCity, 'Paris');
  assert.equal((await request('/favorites')).status, 401);
  assert.equal((await request(`/favorites/${id}`, 'POST', undefined, token)).status, 204);
  assert.equal((await request(`/favorites/${id}`, 'POST', undefined, token)).status, 409);
  assert.equal((await request('/favorites', 'GET', undefined, token)).body[0].isFavorite, true);
  assert.equal((await request(`/offers/${id}`, 'GET', undefined, token)).body.isFavorite, true);
  assert.equal((await request(`/offers/${id}`)).body.isFavorite, false);
  assert.equal((await request(`/favorites/${id}`, 'DELETE', undefined, token)).status, 204);
  assert.equal((await request(`/favorites/${id}`, 'DELETE', undefined, token)).status, 404);
  assert.equal((await request(`/offers/${id}`, 'DELETE', undefined, 'stranger-token')).status, 403);
  assert.equal((await request(`/offers/${id}`, 'DELETE', undefined, token)).status, 204);
  assert.equal((await request(`/offers/${id}`)).status, 404);
  assert.equal((await request('/missing')).status, 404);
  assert.equal((await request('/users/login', 'GET', undefined, 'wrong-token')).status, 401);
  assert.equal((await request('/users/login', 'DELETE', undefined, token)).status, 204);
  assert.equal((await request('/users/login', 'GET', undefined, token)).status, 401);
});
