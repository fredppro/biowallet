import hashlib
import random

# Generate the private keys for the Patient and Healthcare entities
# These are two 128-bit numbers for each private key
patient_private_key = [random.randint(1, 2**128 - 1), random.randint(1, 2**128 - 1)]
healthcare_private_key = [random.randint(1, 2**128 - 1), random.randint(1, 2**128 - 1)]

# Convert each private key to bytes and concatenate them
concatenated_keys_bytes = patient_private_key[0].to_bytes(16, 'big') + patient_private_key[1].to_bytes(16, 'big') + healthcare_private_key[0].to_bytes(16, 'big') + healthcare_private_key[1].to_bytes(16, 'big')

# Compute the SHA-256 hash of the concatenated keys
hash = hashlib.sha256(concatenated_keys_bytes)

# Split the hash into two parts
hash_parts = [int.from_bytes(hash.digest()[:16], 'big'), int.from_bytes(hash.digest()[16:], 'big')]

print("Patient Private Key: ", patient_private_key)
print("Healthcare Private Key: ", healthcare_private_key)
print("Hash Part 0: ", hash_parts[0])
print("Hash Part 1: ", hash_parts[1])