import 'reflect-metadata';
import {container} from './container.js';
import {Application} from './application.js';

const application = container.get(Application);

application.init().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
