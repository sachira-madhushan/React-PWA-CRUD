import CryptoJS from "crypto-js";

export function encryptPassword(password,key) {
    return CryptoJS.AES.encrypt(password, key).toString();
}

export function decryptPassword(encryptedPassword,key) {
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}
