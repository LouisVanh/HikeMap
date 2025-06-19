from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_API_KEY")

supabase: Client = create_client(url, key)

# Example: inserting into 'Users' table
data = {
    "id": "11111111-1111-1111-1111-111111111111",
    "name": "Alice",
    "profile_pic_url": "https://example.com/default.jpg",
    "created_at": "2025-06-09T00:00:00Z",
}

response = supabase.table("Users").insert(data).execute()
print(response)

# Example: Get all hikes
response = supabase.table("Hikes").select("*").execute()
print(response.data)

# Example: Get pictures submitted by a specific user
response = supabase.table("Pictures").select("*").eq("user_id", "11111111-1111-1111-1111-111111111111").execute()
print(response.data)
