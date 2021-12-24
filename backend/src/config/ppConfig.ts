import dotenv from 'dotenv';
import jsonwebtoken from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? ''; 

const jwt = jsonwebtoken;




const generateToken = (username: string) => {
   return JWT_SECRET !== '' ? jwt.sign(username, JWT_SECRET, { expiresIn: '1800s' }) : false;
};
