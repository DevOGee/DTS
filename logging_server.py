import datetime
import json
import requests
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configure Python logging to write to a file
logging.basicConfig(
    filename='activity_audit.log',
    level=logging.INFO,
    format='%(message)s' 
)

def get_geo_location(ip):
    """Fetches geo-data based on IP address."""
    if ip == "127.0.0.1":
        return {"note": "Localhost - No Geo Data"}
    
    try:
        # Using ip-api.com (Free for non-commercial use)
        response = requests.get(f"http://ip-api.com/json/{ip}?fields=status,country,city,lat,lon,query")
        data = response.json()
        
        if data.get("status") == "success":
            return {
                "country": data.get("country"),
                "city": data.get("city"),
                "lat": data.get("lat"),
                "lon": data.get("lon")
            }
    except Exception:
        return {"error": "Geo-lookup failed"}
    
    return {"note": "Location not found"}

def log_event(action, status="info"):
    """Aggregates data and writes the log (MAC Address removed)."""
    
    # 1. Capture IP (Handles Proxies/Load Balancers)
    if request.headers.get('X-Forwarded-For'):
        ip_address = request.headers.get('X-Forwarded-For').split(',')[0]
    else:
        ip_address = request.remote_addr

    # 2. Capture Time (ISO 8601 UTC)
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    # 3. Get Geo-Location
    geo_data = get_geo_location(ip_address)

    # 4. Construct Log Object
    log_entry = {
        "timestamp": timestamp,
        "action": action,
        "status": status,
        "network": {
            "ip": ip_address
        },
        "geo_location": geo_data,
        "user_agent": request.headers.get('User-Agent')
    }

    # Write to file as a JSON string
    logging.info(json.dumps(log_entry))
    return log_entry

def read_logs(limit=50, offset=0):
    """Read logs from file with pagination"""
    try:
        logs = []
        with open('activity_audit.log', 'r') as f:
            lines = f.readlines()
            # Reverse to get newest first
            lines = lines[::-1]
            
            for line in lines[offset:offset+limit]:
                try:
                    log_entry = json.loads(line.strip())
                    # Format for frontend display
                    formatted_entry = {
                        "time": format_time_ago(log_entry["timestamp"]),
                        "level": log_entry.get("status", "info"),
                        "message": log_entry.get("action", "Unknown action"),
                        "user": "System",
                        "timestamp": log_entry["timestamp"],
                        "ip": log_entry["network"]["ip"],
                        "geo_location": log_entry.get("geo_location", {}),
                        "user_agent": log_entry.get("user_agent", "")
                    }
                    logs.append(formatted_entry)
                except json.JSONDecodeError:
                    continue
        return logs
    except FileNotFoundError:
        return []

def format_time_ago(timestamp_str):
    """Convert ISO timestamp to 'time ago' format"""
    try:
        timestamp = datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        now = datetime.datetime.now(datetime.timezone.utc)
        diff = now - timestamp
        
        if diff.total_seconds() < 60:
            return "Just now"
        elif diff.total_seconds() < 3600:
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} min ago"
        elif diff.total_seconds() < 86400:
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        else:
            days = int(diff.total_seconds() / 86400)
            return f"{days} day{'s' if days > 1 else ''} ago"
    except:
        return timestamp_str

# --- Routes ---

@app.route('/action', methods=['POST'])
def perform_action():
    # Example: Capture a generic action from the request
    data = request.json
    action_name = data.get("action", "UNKNOWN_ACTION")
    status = data.get("status", "info")
    
    log_data = log_event(action_name, status)
    return jsonify({"status": "Logged", "captured_data": log_data})

@app.route('/logs', methods=['GET'])
def get_logs():
    """Get paginated logs"""
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))
    
    logs = read_logs(limit, offset)
    return jsonify({"logs": logs})

@app.route('/logs/statistics', methods=['GET'])
def get_log_statistics():
    """Get log statistics"""
    try:
        with open('activity_audit.log', 'r') as f:
            lines = f.readlines()
            
        total_logs = len(lines)
        today = datetime.datetime.now(datetime.timezone.utc).date()
        
        error_count = 0
        warning_count = 0
        info_count = 0
        
        for line in lines:
            try:
                log_entry = json.loads(line.strip())
                timestamp = datetime.datetime.fromisoformat(log_entry["timestamp"].replace('Z', '+00:00'))
                
                if timestamp.date() == today:
                    status = log_entry.get("status", "info")
                    if status == "error":
                        error_count += 1
                    elif status == "warning":
                        warning_count += 1
                    else:
                        info_count += 1
            except:
                continue
                
        return jsonify({
            "total_logs": total_logs,
            "today_errors": error_count,
            "today_warnings": warning_count,
            "today_info": info_count,
            "capture_status": "Active",
            "capture_interval": "5s",
            "retention_days": 30
        })
    except FileNotFoundError:
        return jsonify({
            "total_logs": 0,
            "today_errors": 0,
            "today_warnings": 0,
            "today_info": 0,
            "capture_status": "Active",
            "capture_interval": "5s",
            "retention_days": 30
        })

if __name__ == '__main__':
    print("Logging server active. MAC address field has been removed.")
    print("Server running on http://localhost:5000")
    app.run(debug=True, port=5000)
