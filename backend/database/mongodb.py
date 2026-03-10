"""
MongoDB connection using Motor async driver.
"""
import os
from urllib.parse import quote_plus, urlparse, urlunparse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

DATABASE_NAME = os.getenv("DATABASE_NAME", "projectdefense_ai")


def _encode_mongo_uri(uri: str) -> str:
    """Auto-encode username and password in a MongoDB URI."""
    parsed = urlparse(uri)
    if parsed.username and parsed.password:
        encoded_user = quote_plus(parsed.username)
        encoded_pass = quote_plus(parsed.password)
        # Rebuild netloc with encoded credentials
        host = parsed.hostname
        if parsed.port:
            host = f"{host}:{parsed.port}"
        netloc = f"{encoded_user}:{encoded_pass}@{host}"
        return urlunparse(parsed._replace(netloc=netloc))
    return uri


MONGODB_URL = _encode_mongo_uri(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Create MongoDB connection on startup."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("user_id")
    await db.analyses.create_index("project_id")
    await db.sessions.create_index("project_id")
    print(f"✅ Connected to MongoDB: {DATABASE_NAME}")


async def close_mongo_connection():
    """Close MongoDB connection on shutdown."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    """Return the database instance."""
    return db
