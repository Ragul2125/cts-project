from pydantic import BaseModel, EmailStr
from uuid import UUID

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: str = "PATIENT"

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: UUID
    role: str
    is_active: bool

    model_config = {"from_attributes": True}
