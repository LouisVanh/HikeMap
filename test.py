import os
from dotenv import load_dotenv
import requests

# Load .env variables
load_dotenv()

API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
if not API_KEY:
    raise ValueError("API key not found. Make sure .env is set up correctly.")

# Attempt at automatic location getting
def get_location():
    response = requests.get("http://ip-api.com/json/")
    if response.status_code == 200:
        data = response.json()
        lat = data.get("lat")
        lon = data.get("lon")
        city = data.get("city")
        print(f"📍 Location detected: {city} ({lat}, {lon})")
        return lat, lon
    else:
        raise Exception("Unable to fetch location")

# Example usage:
lat, lng = get_location()

# lat, lng = 52.3702, 4.8952  # Example: Amsterdam
zoom = 5
size = "600x400"
maptype = "satellite"

url = (
    "https://maps.googleapis.com/maps/api/staticmap"
    f"?center={lat},{lng}&zoom={zoom}&size={size}&maptype={maptype}&key={API_KEY}"
)

response = requests.get(url)

if response.status_code == 200:
    with open("map.png", "wb") as f:
        f.write(response.content)
    print("✅ Map saved as map.png")
else:
    print("❌ Error:", response.status_code)
    print(response.text)
