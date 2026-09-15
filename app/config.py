import os

from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8001"))
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cicciotodo.db")
