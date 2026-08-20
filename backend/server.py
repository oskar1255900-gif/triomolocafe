from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from typing import List, Optional, Annotated
from datetime import datetime, timezone, timedelta
from bson import ObjectId
import bcrypt
import jwt
import uuid
import requests

# ---------- Object storage ----------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "trio-molo-cafe"
MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

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


class ReservationInput(BaseModel):
    name: str
    phone: str
    date: str
    time: str = ""
    guests: int = 2
    note: str = ""


class ReservationStatusInput(BaseModel):
    status: str  # accepted | rejected | pending


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
    doc["read"] = False
    await db.messages.insert_one(doc)
    return {"ok": True, "message": "Dziękujemy! Wiadomość została zapisana."}


@api_router.get("/messages")
async def get_messages(user: dict = Depends(get_current_user)):
    docs = await db.messages.find().sort("created_at", -1).to_list(500)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api_router.delete("/messages/{msg_id}")
async def delete_message(msg_id: str, user: dict = Depends(get_current_user)):
    await db.messages.delete_one({"_id": ObjectId(msg_id)})
    return {"ok": True}


# ---------- Reservations ----------
@api_router.post("/reservations")
async def create_reservation(data: ReservationInput):
    doc = data.model_dump()
    doc["status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reservations.insert_one(doc)
    return {"ok": True, "message": "Dziękujemy! Twoja prośba o rezerwację została wysłana. Skontaktujemy się wkrótce."}


@api_router.get("/reservations")
async def get_reservations(user: dict = Depends(get_current_user)):
    docs = await db.reservations.find().sort("created_at", -1).to_list(500)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api_router.put("/reservations/{res_id}/status")
async def update_reservation(res_id: str, data: ReservationStatusInput, user: dict = Depends(get_current_user)):
    await db.reservations.update_one({"_id": ObjectId(res_id)}, {"$set": {"status": data.status}})
    return {"ok": True}


@api_router.delete("/reservations/{res_id}")
async def delete_reservation(res_id: str, user: dict = Depends(get_current_user)):
    await db.reservations.delete_one({"_id": ObjectId(res_id)})
    return {"ok": True}


# ---------- File upload ----------
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Dozwolone są tylko obrazy (jpg, png, gif, webp)")
    path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"
    data = await file.read()
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Nie udało się wgrać pliku")
    stored_path = result["path"]
    await db.files.insert_one({
        "storage_path": stored_path,
        "content_type": content_type,
        "original_filename": file.filename,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{stored_path}", "path": stored_path}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="Nie znaleziono pliku")
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Nie znaleziono pliku")
    return Response(content=data, media_type=record.get("content_type", content_type), headers={"Cache-Control": "public, max-age=86400"})


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
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
