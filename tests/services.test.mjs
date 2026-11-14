import 'reflect-metadata';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import {Types} from 'mongoose';
import {UserService} from '../dist/shared/modules/user/user.service.js';
import {OfferService} from '../dist/shared/modules/offer/offer.service.js';
import {CommentService} from '../dist/shared/modules/comment/comment.service.js';
import {FavouriteService} from '../dist/shared/modules/favourites/favourite.service.js';

const query = (value) => ({
  exec: async () => value,
  select() { return this; },
  sort() { return this; },
  limit() { return this; },
  populate() { return this; }
});

test('user creation hashes passwords and hides the hash', async () => {
  let stored;
  const service = new UserService({create: async (dto) => {
    stored = {...dto};
    return {...dto};
  }}, {get: () => 'test-salt'});
  const user = await service.create({name: 'Anna', email: 'anna@example.com', password: 'secret', userType: 'pro'});
  assert.equal(stored.passwordHash, scryptSync('secret', 'test-salt', 64).toString('hex'));
  assert.equal(user.passwordHash, undefined);
  assert.equal(stored.password, undefined);
});

test('password verification handles correct, wrong and unknown credentials', async () => {
  const hash = scryptSync('secret', 'test-salt', 64).toString('hex');
  const service = new UserService({findOne: ({email}) => query(email === 'anna@example.com' ? {passwordHash: hash} : null)}, {get: () => 'test-salt'});
  assert.equal((await service.verifyPassword('anna@example.com', 'secret')).passwordHash, undefined);
  assert.equal(await service.verifyPassword('anna@example.com', 'wrong'), null);
  assert.equal(await service.verifyPassword('unknown@example.com', 'secret'), null);
});

test('offer lists default to 60 and use descending publication date', async () => {
  const observed = {};
  const model = {find: (filter) => ({
    ...query([]),
    sort(value) { observed.sort = value; return this; },
    limit(value) { observed.limit = value; return this; }
  })};
  const service = new OfferService(model, {}, {});
  assert.deepEqual(await service.find(), []);
  assert.equal(observed.limit, 60);
  assert.equal(observed.sort.date, -1);
  await service.find(100);
  assert.equal(observed.limit, 100);
  await assert.rejects(service.find(0));
  await service.findPremium('Paris');
  assert.equal(observed.limit, 3);
});

test('deletion cleans related records only when the author matches', async () => {
  const removed = [];
  const related = {deleteMany: (filter) => { removed.push(filter); return query({}); }};
  const model = {findOneAndDelete: (filter) => query(filter.author === 'owner' ? {_id: 'offer'} : null)};
  const service = new OfferService(model, related, related);
  assert.equal(await service.delete('offer', 'stranger'), null);
  assert.equal(removed.length, 0);
  await service.delete('offer', 'owner');
  assert.deepEqual(removed, [{offer: 'offer'}, {offer: 'offer'}]);
});

test('comments refresh count and rounded average and populate the author', async () => {
  const offer = new Types.ObjectId();
  let updated;
  const comment = {populate: async (field) => ({field})};
  const comments = {
    create: async () => comment,
    aggregate: () => query([{commentCount: 3, rating: 11 / 3}])
  };
  const offers = {
    exists: async () => true,
    findByIdAndUpdate: (id, update) => { updated = update; return query({}); }
  };
  const service = new CommentService(comments, offers);
  assert.deepEqual(await service.create({offer, author: new Types.ObjectId(), text: 'Great', rating: 4}), {field: 'author'});
  assert.deepEqual(updated.$set, {commentCount: 3, rating: 3.7});
  const missing = new CommentService(comments, {exists: async () => false});
  await assert.rejects(missing.create({offer}), /Offer not found/);
});

test('favourites are scoped to the requesting user', async () => {
  let filter;
  const favourites = {find: (value) => { filter = value; return query([{offer: 'offer'}]); }};
  const offers = {find: () => query([{toObject: () => ({title: 'Home'})}])};
  const service = new FavouriteService(favourites, offers);
  assert.deepEqual(await service.findByUserId('user'), [{title: 'Home', isFavorite: true}]);
  assert.deepEqual(filter, {user: 'user'});
});
