import CryptoJS from "crypto-js";

export function encryptPassword(password,key) {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
}

export function decryptPassword(encryptedPassword,key) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}
