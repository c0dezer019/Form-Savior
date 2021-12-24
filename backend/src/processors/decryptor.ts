require('dotenv').config();
import { AES as aes } from "crypto-js";

type EncryptedValue = string;

const decryptData = (value: EncryptedValue) => {
   return aes.decrypt(value, `${process.env.PASSPHRASE}`);
};

export default decryptData;
