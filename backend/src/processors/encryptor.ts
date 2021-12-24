require('dotenv').config();
import { AES as aes } from "crypto-js";

type InputValue = string;

const encryptData = (formInputValue: InputValue) => {
   return aes.encrypt(formInputValue, `${process.env.PASSPHRASE}`);
};

export default encryptData;
