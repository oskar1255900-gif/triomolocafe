from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from typing import List, Optional, Annotated
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import bcrypt
import jwt

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# ---------- Mongo helpers ----------
PyObjectId = Annotated[str, BeforeValidator(str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc):
        if not doc:
            return None
        doc = dict(doc)
        doc["_id"] = str(doc["_id"])
        return cls(**doc)


# ---------- Auth ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Models ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class MenuItem(BaseDocument):
    name: str
    description: str = ""
    price: str
    category: str = "Menu"
    image: str = ""
    bestseller: bool = False
    order: int = 0


class MenuInput(BaseModel):
    name: str
    description: str = ""
    price: str
    category: str = "Menu"
    image: str = ""
    bestseller: bool = False
    order: int = 0


class GalleryImage(BaseDocument):
    url: str
    category: str = "Taras"
    caption: str = ""
    order: int = 0


class GalleryInput(BaseModel):
    url: str
    category: str = "Taras"
    caption: str = ""
    order: int = 0


class ContactInput(BaseModel):
    name: str
    email: EmailStr
    message: str


# ---------- Auth routes ----------
@api_router.post("/auth/login")
async def login(data: LoginInput):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")
    token = create_access_token(str(user["_id"]), email)
    return {
        "token": token,
        "user": {"id": str(user["_id"]), "email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")},
    }


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Menu routes ----------
@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu(bestseller: Optional[bool] = None):
    q = {}
    if bestseller is not None:
        q["bestseller"] = bestseller
    docs = await db.menu.find(q).sort("order", 1).to_list(500)
    return [MenuItem.from_mongo(d) for d in docs]


@api_router.post("/menu", response_model=MenuItem)
async def create_menu(data: MenuInput, user: dict = Depends(get_current_user)):
    doc = data.model_dump()
    res = await db.menu.insert_one(doc)
    created = await db.menu.find_one({"_id": res.inserted_id})
    return MenuItem.from_mongo(created)


@api_router.put("/menu/{item_id}", response_model=MenuItem)
async def update_menu(item_id: str, data: MenuInput, user: dict = Depends(get_current_user)):
    await db.menu.update_one({"_id": ObjectId(item_id)}, {"$set": data.model_dump()})
    updated = await db.menu.find_one({"_id": ObjectId(item_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Nie znaleziono pozycji")
    return MenuItem.from_mongo(updated)


@api_router.delete("/menu/{item_id}")
async def delete_menu(item_id: str, user: dict = Depends(get_current_user)):
    await db.menu.delete_one({"_id": ObjectId(item_id)})
    return {"ok": True}


# ---------- Gallery routes ----------
@api_router.get("/gallery", response_model=List[GalleryImage])
async def get_gallery(category: Optional[str] = None):
    q = {}
    if category and category != "Wszystkie":
        q["category"] = category
    docs = await db.gallery.find(q).sort("order", 1).to_list(500)
    return [GalleryImage.from_mongo(d) for d in docs]


@api_router.post("/gallery", response_model=GalleryImage)
async def create_gallery(data: GalleryInput, user: dict = Depends(get_current_user)):
    res = await db.gallery.insert_one(data.model_dump())
    created = await db.gallery.find_one({"_id": res.inserted_id})
    return GalleryImage.from_mongo(created)


@api_router.put("/gallery/{img_id}", response_model=GalleryImage)
async def update_gallery(img_id: str, data: GalleryInput, user: dict = Depends(get_current_user)):
    await db.gallery.update_one({"_id": ObjectId(img_id)}, {"$set": data.model_dump()})
    updated = await db.gallery.find_one({"_id": ObjectId(img_id)})
    if not updated:
        raise HTTPException(status_code=404, detail="Nie znaleziono zdjęcia")
    return GalleryImage.from_mongo(updated)


@api_router.delete("/gallery/{img_id}")
async def delete_gallery(img_id: str, user: dict = Depends(get_current_user)):
    await db.gallery.delete_one({"_id": ObjectId(img_id)})
    return {"ok": True}


# ---------- Contact ----------
@api_router.post("/contact")
async def contact(data: ContactInput):
    doc = data.model_dump()
    doc["recipient"] = "trio.molo.cafe@onet.pl"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.messages.insert_one(doc)
    return {"ok": True, "message": "Dziękujemy! Wiadomość została zapisana."}


@api_router.get("/")
async def root():
    return {"message": "Trio Molo Cafe API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_admin():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})


DEFAULT_MENU = [
    {"name": "Sex on the Beach", "description": "Najpopularniejszy koktajl.", "price": "39 zł", "category": "Koktajle", "image": "https://images.pexels.com/photos/3461204/pexels-photo-3461204.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "bestseller": True, "order": 1},
    {"name": "Ciasto dnia", "description": "Szarlotka lub czekoladowe.", "price": "23 zł", "category": "Desery", "image": "https://images.unsplash.com/photo-1609501967126-1a43c02f655c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "bestseller": True, "order": 2},
    {"name": "Cappuccino", "description": "Kremowa kawa z pianką.", "price": "17 zł", "category": "Kawa", "image": "https://images.unsplash.com/photo-1735481537054-74f7153553de?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "bestseller": True, "order": 3},
    {"name": "Aperol Spritz", "description": "Idealny na zachód słońca.", "price": "35 zł", "category": "Koktajle", "image": "https://images.unsplash.com/photo-1782201591364-39945c7f39d2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "bestseller": True, "order": 4},
    {"name": "Latte", "description": "Aksamitne mleko i espresso.", "price": "16 zł", "category": "Kawa", "image": "https://images.unsplash.com/photo-1736813132429-8663cfb32995?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "bestseller": False, "order": 5},
    {"name": "Sernik nowojorski", "description": "Klasyczny, kremowy sernik.", "price": "22 zł", "category": "Desery", "image": "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "bestseller": False, "order": 6},
]

DEFAULT_GALLERY = [
    {"url": "https://images.unsplash.com/photo-1708183751744-d446942720a6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Taras", "caption": "Taras o zachodzie słońca", "order": 1},
    {"url": "https://images.unsplash.com/photo-1774938098144-0bf3728f2329?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Taras", "caption": "Stoliki nad morzem", "order": 2},
    {"url": "https://images.unsplash.com/photo-1736813132429-8663cfb32995?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Kawa", "caption": "Świeżo palona kawa", "order": 3},
    {"url": "https://images.unsplash.com/photo-1735481537054-74f7153553de?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Kawa", "caption": "Cappuccino latte art", "order": 4},
    {"url": "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Ciasta", "caption": "Czekoladowe ciasto", "order": 5},
    {"url": "https://images.unsplash.com/photo-1609501967126-1a43c02f655c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Ciasta", "caption": "Sernik z owocami", "order": 6},
    {"url": "https://images.unsplash.com/photo-1782201591364-39945c7f39d2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Koktajle", "caption": "Aperol Spritz", "order": 7},
    {"url": "https://images.pexels.com/photos/26150629/pexels-photo-26150629.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400", "category": "Koktajle", "caption": "Koktajl nad morzem", "order": 8},
    {"url": "https://images.pexels.com/photos/20728513/pexels-photo-20728513.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400", "category": "Zachód słońca", "caption": "Zachód nad Bałtykiem", "order": 9},
    {"url": "https://images.unsplash.com/photo-1613082852603-f4f1187885ea?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400", "category": "Zachód słońca", "caption": "Złota godzina", "order": 10},
]


async def seed_content():
    if await db.menu.count_documents({}) == 0:
        await db.menu.insert_many(DEFAULT_MENU)
        logger.info("Seeded menu")
    if await db.gallery.count_documents({}) == 0:
        await db.gallery.insert_many(DEFAULT_GALLERY)
        logger.info("Seeded gallery")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await seed_admin()
    await seed_content()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
