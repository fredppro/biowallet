import hmac
import hashlib

def derive_key(master_key, unique_id):
    derived_key = hmac.new(master_key, unique_id.encode(), hashlib.sha256).digest()
    derived_key_parts = [int.from_bytes(derived_key[:16], 'big'), int.from_bytes(derived_key[16:], 'big')]
    return derived_key_parts

def derive_shared_key(key1, key2):
    concatenated_keys = key1[0].to_bytes(16, 'big') + key1[1].to_bytes(16, 'big') + key2[0].to_bytes(16, 'big') + key2[1].to_bytes(16, 'big')
    hash = hashlib.sha256(concatenated_keys)
    hash_parts = [int.from_bytes(hash.digest()[:16], 'big'), int.from_bytes(hash.digest()[16:], 'big')]
    return hash_parts

master_key = b'securely generated master key'
patient_id = 'patient id'
healthcare_id = 'healthcare id'

patient_private_key = derive_key(master_key, patient_id)
healthcare_private_key = derive_key(master_key, healthcare_id)

shared_key = derive_shared_key(patient_private_key, healthcare_private_key)

print('Patient Private Key: ', patient_private_key)
print('Healthcare Private Key: ', healthcare_private_key)
print('Shared Key: ', shared_key)