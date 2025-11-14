import os
import json
import base64
import secrets
from typing import Optional, Any, Dict

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except Exception:
    AESGCM = None


ENC_MARKER = "__enc__"


def _get_key() -> bytes:
    """Load symmetric encryption key from environment.

    Expects `PAYMENT_CONFIG_SECRET_KEY` to be a base64-encoded 32-byte key.
    Optionally supports `PAYMENT_CONFIG_KEY_ID` for key rotation tracking.
    """
    key_b64 = os.getenv("PAYMENT_CONFIG_SECRET_KEY", "")
    if not key_b64:
        raise RuntimeError("Missing PAYMENT_CONFIG_SECRET_KEY environment variable")
    try:
        key = base64.b64decode(key_b64)
    except Exception as e:
        raise RuntimeError("Invalid base64 in PAYMENT_CONFIG_SECRET_KEY") from e
    if len(key) != 32:
        raise RuntimeError("PAYMENT_CONFIG_SECRET_KEY must decode to 32 bytes (AES-256)")
    return key


def is_encrypted(value: Optional[str]) -> bool:
    """Heuristically determine if the stored config string is an encrypted envelope."""
    if not value:
        return False
    try:
        obj = json.loads(value)
        return isinstance(obj, dict) and obj.get(ENC_MARKER) is True and "ct" in obj and "nonce" in obj
    except Exception:
        return False


def encrypt_config(config_obj: Dict[str, Any]) -> str:
    """Encrypt config object using AES-GCM and return envelope JSON string.

    Envelope format:
    {
      "__enc__": true,
      "v": 1,
      "alg": "AESGCM",
      "kid": "default",
      "nonce": base64,
      "ct": base64
    }
    """
    if AESGCM is None:
        raise RuntimeError("cryptography library is required for encryption")
    key = _get_key()
    aesgcm = AESGCM(key)
    nonce = secrets.token_bytes(12)  # AES-GCM standard 96-bit nonce
    plaintext = json.dumps(config_obj, ensure_ascii=False).encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    envelope = {
        ENC_MARKER: True,
        "v": 1,
        "alg": "AESGCM",
        "kid": os.getenv("PAYMENT_CONFIG_KEY_ID", "default"),
        "nonce": base64.b64encode(nonce).decode("ascii"),
        "ct": base64.b64encode(ciphertext).decode("ascii"),
    }
    return json.dumps(envelope, ensure_ascii=False)


def decrypt_config(value: Optional[str]) -> Optional[Dict[str, Any]]:
    """Decrypt envelope if present; otherwise parse plaintext JSON.

    Returns dict on success, or None on failure.
    """
    if not value:
        return None
    # If looks like encrypted envelope, decrypt.
    if is_encrypted(value):
        if AESGCM is None:
            # Cannot decrypt without cryptography
            return None
        try:
            obj = json.loads(value)
            key = _get_key()
            aesgcm = AESGCM(key)
            nonce = base64.b64decode(obj["nonce"])
            ct = base64.b64decode(obj["ct"])
            plaintext = aesgcm.decrypt(nonce, ct, None)
            return json.loads(plaintext.decode("utf-8"))
        except Exception:
            return None
    # Fallback: treat as plaintext JSON
    try:
        return json.loads(value)
    except Exception:
        return None