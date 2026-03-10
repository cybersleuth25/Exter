"""
Authentication routes — signup, login, JWT middleware.
"""
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId
from dotenv import load_dotenv

from database.mongodb import get_db
from models.user_model import UserCreate, UserLogin, UserResponse, TokenResponse

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=EXPIRATION_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency — extracts and validates JWT, returns user dict."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(user_data: UserCreate):
    db = get_db()

    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": pwd_context.hash(user_data.password),
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email,
            created_at=user_doc["created_at"],
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    db = get_db()

    user = await db.users.find_one({"email": user_data.email})
    if not user or not pwd_context.verify(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"],
        ),
    )
