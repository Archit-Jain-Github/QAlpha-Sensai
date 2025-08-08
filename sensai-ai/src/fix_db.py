import asyncio
import os
from api.db import init_db
from api.config import UPLOAD_FOLDER_NAME

async def main():
    print("Initializing database...")
    
    # Ensure the uploads folder exists
    root_dir = os.path.dirname(os.path.abspath(__file__))
    upload_folder = os.path.join(root_dir, UPLOAD_FOLDER_NAME)
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        print(f"Created uploads folder: {upload_folder}")
    
    # Initialize database
    await init_db()
    print("Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(main())
