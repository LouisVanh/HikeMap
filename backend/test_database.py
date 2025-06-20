from datetime import datetime
from dotenv import load_dotenv
import os
import uuid
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
api_key = os.getenv("SUPABASE_API_KEY")
service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, api_key)
supabase_admin: Client = create_client(url, service_key)

user_id = str(uuid.uuid4())
hike_id = str(uuid.uuid4())
# Example: inserting into 'Users' table
data = {
    "id": user_id,
    "name": "John Smith",
    "profile_pic_url": "https://example.com/default.jpg",
    "created_at": "2025-06-09T00:00:00Z",
}

response = supabase_admin.table("Users").insert(data).execute()
print(response)

# Example: Add a hike
new_hike = {
    "hike_id": hike_id,
    "user_id": user_id,
    "hike_name": "Sunset Ridge Trail",
    "route_geometry": "SRID=4326;LINESTRING(5.1 51.2, 5.2 51.3, 5.3 51.4)",  # WKT format
    "created_at": datetime.now().isoformat()
}

response = supabase_admin.table("Hikes").insert(new_hike).execute()
print(f"Hikes response: response")

# Example: Get all hikes
response = supabase_admin.table("Hikes").select("*").execute()
print(response.data)

# Example: Get pictures submitted by a specific user
response = supabase_admin.table("Pictures").select("*").eq("user_id", "11111111-1111-1111-1111-111111111111").execute()
print(response.data)
