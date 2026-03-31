from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets
from bson import ObjectId

ROOT_DIR = Path(__file__).parent

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Password helpers
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT helpers
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, 
        "email": email, 
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id, 
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth dependency
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
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

async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# Create the main app
app = FastAPI(title="GHF Agency API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    created_at: datetime

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Event Models
class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    image_url: Optional[str] = None
    price: float = 0
    capacity: int = 100
    category: str = "party"

class EventResponse(BaseModel):
    id: str
    title: str
    description: str
    date: datetime
    location: str
    image_url: Optional[str] = None
    price: float
    capacity: int
    available_spots: int
    category: str
    created_at: datetime

# Reservation Models
class ReservationCreate(BaseModel):
    event_id: str
    guests: int = 1
    phone: str
    special_requests: Optional[str] = None

class ReservationResponse(BaseModel):
    id: str
    event_id: str
    event_title: str
    user_id: str
    user_name: str
    guests: int
    phone: str
    special_requests: Optional[str]
    status: str
    created_at: datetime

# Gallery Models
class GalleryItemCreate(BaseModel):
    title: str
    event_id: Optional[str] = None
    media_type: str = "image"
    url: str

class GalleryItemResponse(BaseModel):
    id: str
    title: str
    event_id: Optional[str]
    event_name: Optional[str]
    media_type: str
    url: str
    uploaded_by: str
    created_at: datetime

# Contest Models
class ContestCreate(BaseModel):
    title: str
    description: str
    prize: str
    end_date: datetime
    image_url: Optional[str] = None

class ContestParticipation(BaseModel):
    contest_id: str
    answer: Optional[str] = None

class ContestResponse(BaseModel):
    id: str
    title: str
    description: str
    prize: str
    end_date: datetime
    image_url: Optional[str]
    participants_count: int
    winners: List[str]
    is_active: bool
    created_at: datetime

# Testimonial Models
class TestimonialCreate(BaseModel):
    content: str
    rating: int = 5

class TestimonialResponse(BaseModel):
    id: str
    user_name: str
    user_avatar: Optional[str]
    content: str
    rating: int
    approved: bool
    created_at: datetime

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register")
async def register(user: UserRegister, response: Response):
    email = user.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = hash_password(user.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": user.name,
        "role": "user",
        "avatar": None,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": email,
        "name": user.name,
        "role": "user",
        "avatar": None,
        "created_at": user_doc["created_at"].isoformat(),
        "access_token": access_token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, request: Request, response: Response):
    email = credentials.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    
    # Check brute force
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_time = attempt.get("last_attempt", datetime.now(timezone.utc))
        if datetime.now(timezone.utc) - lockout_time < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many login attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})
    
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc)}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    await db.login_attempts.delete_one({"identifier": identifier})
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "avatar": user.get("avatar"),
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"],
        "access_token": access_token
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "avatar": user.get("avatar"),
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"]
    }

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        
        return {"message": "Token refreshed", "access_token": access_token}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.put("/auth/profile")
async def update_profile(request: Request, user: dict = Depends(get_current_user)):
    data = await request.json()
    update_fields = {}
    if "name" in data:
        update_fields["name"] = data["name"]
    if "avatar" in data:
        update_fields["avatar"] = data["avatar"]
    
    if update_fields:
        await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_fields})
    
    updated_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "name": updated_user["name"],
        "role": updated_user["role"],
        "avatar": updated_user.get("avatar"),
        "created_at": updated_user["created_at"].isoformat() if isinstance(updated_user["created_at"], datetime) else updated_user["created_at"]
    }

# ==================== EVENTS ENDPOINTS ====================

@api_router.get("/events")
async def get_events(category: Optional[str] = None, upcoming: bool = True):
    query = {}
    if category:
        query["category"] = category
    if upcoming:
        query["date"] = {"$gte": datetime.now(timezone.utc)}
    
    events = await db.events.find(query, {"_id": 0}).sort("date", 1).to_list(50)
    for event in events:
        if isinstance(event.get("date"), datetime):
            event["date"] = event["date"].isoformat()
        if isinstance(event.get("created_at"), datetime):
            event["created_at"] = event["created_at"].isoformat()
    return events

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if isinstance(event.get("date"), datetime):
        event["date"] = event["date"].isoformat()
    if isinstance(event.get("created_at"), datetime):
        event["created_at"] = event["created_at"].isoformat()
    return event

@api_router.post("/events")
async def create_event(event: EventCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    event_doc = {
        "id": str(uuid.uuid4()),
        "title": event.title,
        "description": event.description,
        "date": event.date,
        "location": event.location,
        "image_url": event.image_url,
        "price": event.price,
        "capacity": event.capacity,
        "available_spots": event.capacity,
        "category": event.category,
        "created_at": datetime.now(timezone.utc)
    }
    await db.events.insert_one(event_doc)
    event_doc.pop("_id", None)
    event_doc["date"] = event_doc["date"].isoformat()
    event_doc["created_at"] = event_doc["created_at"].isoformat()
    return event_doc

# ==================== RESERVATIONS ENDPOINTS ====================

@api_router.post("/reservations")
async def create_reservation(reservation: ReservationCreate, user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": reservation.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event["available_spots"] < reservation.guests:
        raise HTTPException(status_code=400, detail="Not enough spots available")
    
    reservation_doc = {
        "id": str(uuid.uuid4()),
        "event_id": reservation.event_id,
        "event_title": event["title"],
        "user_id": user["_id"],
        "user_name": user["name"],
        "guests": reservation.guests,
        "phone": reservation.phone,
        "special_requests": reservation.special_requests,
        "status": "confirmed",
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.reservations.insert_one(reservation_doc)
    await db.events.update_one(
        {"id": reservation.event_id},
        {"$inc": {"available_spots": -reservation.guests}}
    )
    
    reservation_doc.pop("_id", None)
    reservation_doc["created_at"] = reservation_doc["created_at"].isoformat()
    return reservation_doc

@api_router.get("/reservations/my")
async def get_my_reservations(user: dict = Depends(get_current_user)):
    reservations = await db.reservations.find(
        {"user_id": user["_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    for r in reservations:
        if isinstance(r.get("created_at"), datetime):
            r["created_at"] = r["created_at"].isoformat()
    return reservations

@api_router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: str, user: dict = Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation["user_id"] != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.events.update_one(
        {"id": reservation["event_id"]},
        {"$inc": {"available_spots": reservation["guests"]}}
    )
    await db.reservations.delete_one({"id": reservation_id})
    return {"message": "Reservation cancelled"}

# ==================== GALLERY ENDPOINTS ====================

@api_router.get("/gallery")
async def get_gallery(event_id: Optional[str] = None, media_type: Optional[str] = None):
    query = {}
    if event_id:
        query["event_id"] = event_id
    if media_type:
        query["media_type"] = media_type
    
    items = await db.gallery.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    for item in items:
        if isinstance(item.get("created_at"), datetime):
            item["created_at"] = item["created_at"].isoformat()
    return items

@api_router.post("/gallery")
async def upload_to_gallery(item: GalleryItemCreate, user: dict = Depends(get_current_user)):
    event_name = None
    if item.event_id:
        event = await db.events.find_one({"id": item.event_id})
        event_name = event["title"] if event else None
    
    gallery_doc = {
        "id": str(uuid.uuid4()),
        "title": item.title,
        "event_id": item.event_id,
        "event_name": event_name,
        "media_type": item.media_type,
        "url": item.url,
        "uploaded_by": user["name"],
        "user_id": user["_id"],
        "created_at": datetime.now(timezone.utc)
    }
    await db.gallery.insert_one(gallery_doc)
    gallery_doc.pop("_id", None)
    gallery_doc["created_at"] = gallery_doc["created_at"].isoformat()
    return gallery_doc

@api_router.delete("/gallery/{item_id}")
async def delete_gallery_item(item_id: str, user: dict = Depends(get_current_user)):
    item = await db.gallery.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    if item["user_id"] != user["_id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.gallery.delete_one({"id": item_id})
    return {"message": "Item deleted"}

# ==================== CONTESTS ENDPOINTS ====================

@api_router.get("/contests")
async def get_contests(active_only: bool = True):
    query = {}
    if active_only:
        query["end_date"] = {"$gte": datetime.now(timezone.utc)}
    
    contests = await db.contests.find(query, {"_id": 0}).sort("end_date", 1).to_list(50)
    for contest in contests:
        # Store original datetime for comparison before converting to string
        end_date_dt = contest.get("end_date")
        if isinstance(end_date_dt, datetime):
            # Ensure timezone awareness for comparison
            if end_date_dt.tzinfo is None:
                end_date_dt = end_date_dt.replace(tzinfo=timezone.utc)
            contest["is_active"] = end_date_dt > datetime.now(timezone.utc)
            contest["end_date"] = contest["end_date"].isoformat()
        else:
            # Handle string dates
            contest["is_active"] = datetime.fromisoformat(contest["end_date"].replace("Z", "+00:00")) > datetime.now(timezone.utc)
        
        if isinstance(contest.get("created_at"), datetime):
            contest["created_at"] = contest["created_at"].isoformat()
    return contests

@api_router.post("/contests")
async def create_contest(contest: ContestCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    contest_doc = {
        "id": str(uuid.uuid4()),
        "title": contest.title,
        "description": contest.description,
        "prize": contest.prize,
        "end_date": contest.end_date,
        "image_url": contest.image_url,
        "participants": [],
        "participants_count": 0,
        "winners": [],
        "created_at": datetime.now(timezone.utc)
    }
    await db.contests.insert_one(contest_doc)
    contest_doc.pop("_id", None)
    contest_doc["end_date"] = contest_doc["end_date"].isoformat()
    contest_doc["created_at"] = contest_doc["created_at"].isoformat()
    contest_doc["is_active"] = True
    return contest_doc

@api_router.post("/contests/{contest_id}/participate")
async def participate_in_contest(contest_id: str, participation: ContestParticipation, user: dict = Depends(get_current_user)):
    contest = await db.contests.find_one({"id": contest_id})
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    
    if user["_id"] in contest.get("participants", []):
        raise HTTPException(status_code=400, detail="Already participating")
    
    await db.contests.update_one(
        {"id": contest_id},
        {
            "$push": {"participants": user["_id"]},
            "$inc": {"participants_count": 1}
        }
    )
    return {"message": "Successfully registered for contest"}

@api_router.get("/contests/{contest_id}")
async def get_contest(contest_id: str):
    contest = await db.contests.find_one({"id": contest_id}, {"_id": 0, "participants": 0})
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    if isinstance(contest.get("end_date"), datetime):
        contest["end_date"] = contest["end_date"].isoformat()
    if isinstance(contest.get("created_at"), datetime):
        contest["created_at"] = contest["created_at"].isoformat()
    contest["is_active"] = datetime.fromisoformat(contest["end_date"].replace("Z", "+00:00")) > datetime.now(timezone.utc) if isinstance(contest["end_date"], str) else contest["end_date"] > datetime.now(timezone.utc)
    return contest

# ==================== TESTIMONIALS ENDPOINTS ====================

@api_router.get("/testimonials")
async def get_testimonials(approved_only: bool = True):
    query = {"approved": True} if approved_only else {}
    testimonials = await db.testimonials.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    for t in testimonials:
        if isinstance(t.get("created_at"), datetime):
            t["created_at"] = t["created_at"].isoformat()
    return testimonials

@api_router.post("/testimonials")
async def create_testimonial(testimonial: TestimonialCreate, user: dict = Depends(get_current_user)):
    testimonial_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["_id"],
        "user_name": user["name"],
        "user_avatar": user.get("avatar"),
        "content": testimonial.content,
        "rating": min(5, max(1, testimonial.rating)),
        "approved": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.testimonials.insert_one(testimonial_doc)
    testimonial_doc.pop("_id", None)
    testimonial_doc["created_at"] = testimonial_doc["created_at"].isoformat()
    return testimonial_doc

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/stats")
async def get_admin_stats(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    users_count = await db.users.count_documents({})
    events_count = await db.events.count_documents({})
    reservations_count = await db.reservations.count_documents({})
    contests_count = await db.contests.count_documents({})
    
    return {
        "users": users_count,
        "events": events_count,
        "reservations": reservations_count,
        "contests": contests_count
    }

# ==================== SEED DATA ====================

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@ghfagency.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "GHFAdmin2024!")
    
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "GHF Admin",
            "role": "admin",
            "avatar": None,
            "created_at": datetime.now(timezone.utc)
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logger.info(f"Admin password updated: {admin_email}")

async def seed_events():
    count = await db.events.count_documents({})
    if count == 0:
        events = [
            {
                "id": str(uuid.uuid4()),
                "title": "NEON NIGHTS",
                "description": "Une soirée électrique avec les meilleurs DJs de la scène underground. Préparez-vous pour une nuit inoubliable de beats et de lumières.",
                "date": datetime.now(timezone.utc) + timedelta(days=7),
                "location": "Le Palace, Paris",
                "image_url": "https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg",
                "price": 25.0,
                "capacity": 500,
                "available_spots": 500,
                "category": "party",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "GOLDEN LUXE",
                "description": "Soirée VIP exclusive dans le cadre le plus luxueux de Paris. Dress code: élégant. Champagne et cocktails premium inclus.",
                "date": datetime.now(timezone.utc) + timedelta(days=14),
                "location": "Rooftop Luxury, Paris",
                "image_url": "https://images.pexels.com/photos/18718691/pexels-photo-18718691.jpeg",
                "price": 75.0,
                "capacity": 150,
                "available_spots": 150,
                "category": "vip",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "TECHNO TEMPLE",
                "description": "Les légendes de la techno se réunissent pour une nuit de pure extase musicale. Son surround 360°.",
                "date": datetime.now(timezone.utc) + timedelta(days=21),
                "location": "Warehouse District, Lyon",
                "image_url": "https://images.pexels.com/photos/13230724/pexels-photo-13230724.jpeg",
                "price": 35.0,
                "capacity": 800,
                "available_spots": 800,
                "category": "techno",
                "created_at": datetime.now(timezone.utc)
            }
        ]
        await db.events.insert_many(events)
        logger.info("Seed events created")

async def seed_gallery():
    count = await db.gallery.count_documents({})
    if count == 0:
        gallery_items = [
            {
                "id": str(uuid.uuid4()),
                "title": "Opening Night",
                "event_id": None,
                "event_name": None,
                "media_type": "image",
                "url": "https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg",
                "uploaded_by": "GHF Team",
                "user_id": "system",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "VIP Lounge",
                "event_id": None,
                "event_name": None,
                "media_type": "image",
                "url": "https://images.pexels.com/photos/18718691/pexels-photo-18718691.jpeg",
                "uploaded_by": "GHF Team",
                "user_id": "system",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Crowd Energy",
                "event_id": None,
                "event_name": None,
                "media_type": "image",
                "url": "https://images.pexels.com/photos/13230724/pexels-photo-13230724.jpeg",
                "uploaded_by": "GHF Team",
                "user_id": "system",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "DJ Performance",
                "event_id": None,
                "event_name": None,
                "media_type": "image",
                "url": "https://images.pexels.com/photos/7446876/pexels-photo-7446876.jpeg",
                "uploaded_by": "GHF Team",
                "user_id": "system",
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Neon Vibes",
                "event_id": None,
                "event_name": None,
                "media_type": "image",
                "url": "https://images.unsplash.com/photo-1659273145161-fb9794dedd74",
                "uploaded_by": "GHF Team",
                "user_id": "system",
                "created_at": datetime.now(timezone.utc)
            }
        ]
        await db.gallery.insert_many(gallery_items)
        logger.info("Seed gallery created")

async def seed_contests():
    count = await db.contests.count_documents({})
    if count == 0:
        contests = [
            {
                "id": str(uuid.uuid4()),
                "title": "GAGNE 2 PLACES VIP",
                "description": "Participe et tente de gagner 2 places VIP pour notre prochaine soirée NEON NIGHTS ! Accès backstage + bouteille de champagne offerte.",
                "prize": "2 Places VIP + Champagne",
                "end_date": datetime.now(timezone.utc) + timedelta(days=5),
                "image_url": "https://images.pexels.com/photos/11481894/pexels-photo-11481894.jpeg",
                "participants": [],
                "participants_count": 0,
                "winners": [],
                "created_at": datetime.now(timezone.utc)
            }
        ]
        await db.contests.insert_many(contests)
        logger.info("Seed contests created")

async def seed_testimonials():
    count = await db.testimonials.count_documents({})
    if count == 0:
        testimonials = [
            {
                "id": str(uuid.uuid4()),
                "user_id": "system",
                "user_name": "Sophie M.",
                "user_avatar": None,
                "content": "Incroyable soirée ! L'ambiance était folle et le son parfait. Je reviendrai sans hésiter !",
                "rating": 5,
                "approved": True,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "system",
                "user_name": "Thomas L.",
                "user_avatar": None,
                "content": "Le meilleur club de Paris, hands down. Staff au top et musique de qualité.",
                "rating": 5,
                "approved": True,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "system",
                "user_name": "Marie K.",
                "user_avatar": None,
                "content": "J'ai adoré l'espace VIP ! Un vrai luxe. Merci GHF Agency !",
                "rating": 5,
                "approved": True,
                "created_at": datetime.now(timezone.utc)
            }
        ]
        await db.testimonials.insert_many(testimonials)
        logger.info("Seed testimonials created")

# Include router and startup
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.events.create_index("date")
    await db.events.create_index("id", unique=True)
    await db.reservations.create_index("user_id")
    await db.gallery.create_index("event_id")
    await db.contests.create_index("end_date")
    
    await seed_admin()
    await seed_events()
    await seed_gallery()
    await seed_contests()
    await seed_testimonials()
    
    # Write credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {os.environ.get('ADMIN_EMAIL', 'admin@ghfagency.com')}\n")
        f.write(f"- Password: {os.environ.get('ADMIN_PASSWORD', 'GHFAdmin2024!')}\n")
        f.write("- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/refresh\n")
    logger.info("Startup complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@api_router.get("/")
async def root():
    return {"message": "GHF Agency API", "status": "running"}
