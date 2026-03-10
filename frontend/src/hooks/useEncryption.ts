import { useCallback } from 'react';
import { encryptRSA, decryptRSA, generateKeyPair } from '../utils/encryption';
import { apiService } from '../services/api';

export const useEncryption = () => {
  const getReceiverPublicKey = useCallback(async (receiverId: string) => {
    try {
      const response = await apiService.get(`/auth/public-key/${receiverId}`);
      return response.data.public_key;
    } catch (error) {
      console.error('Failed to fetch public key:', error);
      throw error;
    }
  }, []);

  const encryptMessage = useCallback(async (message: string, receiverId: string) => {
    try {
      const publicKey = await getReceiverPublicKey(receiverId);
      const { encrypted, iv } = await encryptRSA(message, publicKey);
      return { encrypted, iv };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  }, [getReceiverPublicKey]);

  const decryptMessage = useCallback(async (encryptedMessage: string, iv: string) => {
    try {
      const privateKey = localStorage.getItem('privateKey');
      if (!privateKey) {
        throw new Error('Private key not found');
      }
      const decrypted = await decryptRSA(encryptedMessage, iv, privateKey);
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  }, []);

  return {
    encryptMessage,
    decryptMessage,
    getReceiverPublicKey,
    generateKeyPair,
  };
};
