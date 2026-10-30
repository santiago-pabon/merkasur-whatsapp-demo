async function hashPassword(password) {
  const iterations = 150000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, key, 256);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return 'pbkdf2$' + iterations + '$' + saltHex + '$' + hex;
}

async function verifyPassword(password, encodedHash) {
  const [algorithm, rawIterations, saltHex, expectedHex] = encodedHash.split('$');
  if (algorithm !== 'pbkdf2' || !rawIterations || !saltHex || !expectedHex) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((byte) => parseInt(byte, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: Number(rawIterations), hash: 'SHA-256' }, key, 256);
  const actualHex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  if (actualHex.length !== expectedHex.length) return false;
  let difference = 0;
  for (let index = 0; index < actualHex.length; index += 1) difference |= actualHex.charCodeAt(index) ^ expectedHex.charCodeAt(index);
  return difference === 0;
}
