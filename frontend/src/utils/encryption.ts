export const generateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

  const publicKeyStr = JSON.stringify(publicKeyJwk);
  const privateKeyStr = JSON.stringify(privateKeyJwk);

  localStorage.setItem('privateKey', privateKeyStr);

  return {
    publicKey: publicKeyStr,
    privateKey: privateKeyStr,
  };
};

export const encryptRSA = async (
  message: string,
  publicKeyStr: string
): Promise<{ encrypted: string; iv: string }> => {
  const publicKeyJwk = JSON.parse(publicKeyStr);
  const publicKey = await window.crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );

  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(16));

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    'RSA-OAEP',
    publicKey,
    messageBuffer
  );

  const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
  const encryptedStr = btoa(String.fromCharCode.apply(null, encryptedArray as any));
  const ivStr = btoa(String.fromCharCode.apply(null, Array.from(iv) as any));

  return { encrypted: encryptedStr, iv: ivStr };
};

export const decryptRSA = async (
  encryptedStr: string,
  ivStr: string,
  privateKeyStr: string
): Promise<string> => {
  const privateKeyJwk = JSON.parse(privateKeyStr);
  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['decrypt']
  );

  const encryptedArray = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    'RSA-OAEP',
    privateKey,
    encryptedArray
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
