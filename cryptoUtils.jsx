import CryptoJS from 'crypto-js';

const SECRET_KEY = 'secret-key'; // Ideally, this should be stored securely (e.g., in an environment variable)

// Encrypt function
export const encryptData = (data) => {
  if (!data) return null;
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

// Decrypt function
export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8); // Convert to UTF-8 string
};
