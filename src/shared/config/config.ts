import 'dotenv/config';
import convict from 'convict';
import validator from 'convict-format-with-validator';

convict.addFormats(validator);

export const config = convict({
  dbPort: {
    env: 'DB_PORT',
    format: 'port',
    default: null,
    nullable: false
  },
  dbName: {
    env: 'DB_NAME',
    format: (value: unknown) => {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('Missing required parameter \'dbName\'');
      }
    },
    default: null,
    nullable: false
  },
  port: {
    env: 'PORT',
    format: 'port',
    default: null,
    nullable: false
  },
  dbHost: {
    env: 'DB_HOST',
    format: 'ipaddress',
    default: null,
    nullable: false
  },
  salt: {
    env: 'SALT',
    format: (value: unknown) => {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('SALT must be a non-empty string');
      }
    },
    default: '',
    nullable: false
  }
});

export type AppConfig = typeof config;
