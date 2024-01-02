const crypto = require('crypto');

function deriveKey(masterKey, uniqueId) {
    const hmac = crypto.createHmac('sha256', masterKey);
    hmac.update(uniqueId);
    const derivedKey = hmac.digest();
    const derivedKeyParts = [
        BigInt('0x' + derivedKey.slice(0, 16).toString('hex')),
        BigInt('0x' + derivedKey.slice(16).toString('hex'))
    ];
    return derivedKeyParts.map(part => part.toString());
}

function deriveSharedKey(key1, key2) {
    const concatenatedKeys = Buffer.concat([
        Buffer.from(BigInt(key1[0]).toString(16).padStart(32, '0'), 'hex'),
        Buffer.from(BigInt(key1[1]).toString(16).padStart(32, '0'), 'hex'),
        Buffer.from(BigInt(key2[0]).toString(16).padStart(32, '0'), 'hex'),
        Buffer.from(BigInt(key2[1]).toString(16).padStart(32, '0'), 'hex')
    ]);
    const hash = crypto.createHash('sha256');
    hash.update(concatenatedKeys);
    const sharedKey = hash.digest();
    const sharedKeyParts = [
        BigInt('0x' + sharedKey.slice(0, 16).toString('hex')),
        BigInt('0x' + sharedKey.slice(16).toString('hex'))
    ];
    return sharedKeyParts.map(part => part.toString());
}

const masterKey = 'securely generated master key';
const patientId = 'patient id';
const healthcareId = 'healthcare id';

const patientPrivateKey = deriveKey(masterKey, patientId);
const healthcarePrivateKey = deriveKey(masterKey, healthcareId);

const sharedKey = deriveSharedKey(patientPrivateKey, healthcarePrivateKey);

console.log('Patient Private Key: ', patientPrivateKey);
console.log('Healthcare Private Key: ', healthcarePrivateKey);
console.log('Shared Key: ', sharedKey);