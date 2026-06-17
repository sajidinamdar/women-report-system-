import hashlib

def calculate_hash(file_bytes: bytes) -> str:
    """
    Generate SHA-256 hash for raw file bytes.
    """
    sha256 = hashlib.sha256()
    sha256.update(file_bytes)
    return sha256.hexdigest()

def verify_hash(file_bytes: bytes, stored_hash: str) -> bool:
    """
    Compare recalculated hash with the stored hash.
    """
    if not stored_hash:
        return False
    return calculate_hash(file_bytes).lower() == stored_hash.lower()

def calculate_block_hash(data_str: str, prev_hash: str) -> str:
    """
    Generate a block hash by combining current data and the previous block's hash.
    This creates the cryptographic link for the blockchain-inspired ledger.
    """
    combined = f"{data_str}{prev_hash or '0'*64}"
    return hashlib.sha256(combined.encode()).hexdigest()
