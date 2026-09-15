from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import crud
from app.database import Base, SessionLocal, engine
from app.routers import categories, tags, tasks

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    crud.seed_default_user(db)

app = FastAPI(title="CiccioTodo API")

# In produzione il frontend e' servito dallo stesso dominio tramite Caddy
# (percorso relativo /api), quindi CORS serve solo per lo sviluppo locale
# dove Vite gira su una porta diversa da uvicorn.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(categories.router)
app.include_router(tags.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "cicciotodo"}
