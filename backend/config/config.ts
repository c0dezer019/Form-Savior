import dotenv from 'dotenv';

dotenv.config();

export default {
   development: {
      username: process.env.USER,
      password: process.env.DB_PASS,
      database: process.env.FS_DB,
      host: '127.0.0.1',
      dialect: 'postgres',
   },
   testing: {
      username: process.env.USER,
      password: process.env.DB_TEST_PASS,
      database: process.env.FS_TEST_DB,
      host: '127.0.0.1',
      dialect: 'postgres',
   },
   production: {
      username: process.env.USER,
      password: process.env.DB_PROD_PASS,
      database: process.env.FS_PROD_DB,
      host: '127.0.0.1',
      dialect: 'postgres',
   },
};
