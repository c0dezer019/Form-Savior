require('dotenv').config({ path: '../.env' });
require(__dirname + '../config/config')[process.env.DB_PASS!];
import express from 'express';
import cors from 'cors';
import flash from 'connect-flash';
import session from 'express-session';

import decryptData from './processors/decryptor';
import encryptData from './processors/encryptor';

type EnvVariable = any;

const app = express();
const port = 5000;

app.use(require('morgan')('dev'));
app.use(cors({
   methods: "GET",
}));

app.use(
   express.urlencoded({
      extended: false,
   })
);

app.use(
   session({
      secret: process.env.SECRET!,
      resave: false,
      saveUninitialized: true,
   })
);

app.use(flash());

app.get('/', (req, res) => {

});

app.get('/lock', (req, res) => {
   
});

app.get('/unlock', (req, res) => { });

app.listen(port, () => console.log(`Running on port ${port}`));