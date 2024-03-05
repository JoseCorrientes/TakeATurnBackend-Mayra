import cryptojs from 'crypto-js';
import 'dotenv/config' ;
const key= process.env.ENCODE_KEY


function encryptData (data) {
    data = JSON.stringify(data);
    const cipherText=cryptojs.AES.encrypt(data,key).toString();
    return cipherText;
}

function decryptData(data) {
    const decypherText=cryptojs.AES.decrypt(data, key).toString(cryptojs.enc.Utf8)
    return JSON.parse(decypherText);
}



export {encryptData, decryptData}