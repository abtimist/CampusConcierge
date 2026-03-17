import CryptoJS from "crypto-js";

const SECRET = process.env.ENCRYPTION_KEY;

/**
 * Encrypt a plain-text string (e.g. a Google OAuth token)
 * Returns a Base64-encoded ciphertext string safe to store in MongoDB.
 */
export const encrypt = (text) => {
    if (!text) return null;
    return CryptoJS.AES.encrypt(text, SECRET).toString();
};

/**
 * Decrypt a previously encrypted string.
 */
export const decrypt = (cipherText) => {
    if (!cipherText) return null;
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
};
