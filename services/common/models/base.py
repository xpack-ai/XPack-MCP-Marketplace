from sqlalchemy.orm import DeclarativeBase
from enum import Enum as PyEnum

class Base(DeclarativeBase):
    pass


class AuthMethod(PyEnum):
    FREE = "free"
    APIKEY = "apikey"
    TOKEN = "token"


class ChargeType(PyEnum):
    FREE = "free"
    PER_CALL = "per_call"
    PER_TOKEN = "per_token"
