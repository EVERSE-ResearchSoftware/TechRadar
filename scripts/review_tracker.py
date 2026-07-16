import json
from pathlib import Path

TRACKER_FILE = Path("scripts/review_status.json")
CATALOG_DIR = Path("quality-tools")

def init_tracker():
    if TRACKER_FILE.exists():
        return
    
    tools = [f.name for f in CATALOG_DIR.glob("*.json")]
    status = {tool: {"reviewed": False, "last_check": None, "issues": []} for tool in tools}
    
    with open(TRACKER_FILE, "w") as f:
        json.dump(status, f, indent=2)

def get_next_batch(size=5):
    with open(TRACKER_FILE, "r") as f:
        status = json.load(f)
    
    pending = [tool for tool, meta in status.items() if not meta["reviewed"]]
    return pending[:size]

def mark_reviewed(tool, issues=None):
    with open(TRACKER_FILE, "r") as f:
        status = json.load(f)
    
    status[tool] = {
        "reviewed": True,
        "last_check": "2026-06-01",
        "issues": issues or []
    }
    
    with open(TRACKER_FILE, "w") as f:
        json.dump(status, f, indent=2)

if __name__ == "__main__":
    init_tracker()
    next_batch = get_next_batch()
    if next_batch:
        print(f"Next tools for deep review: {', '.join(next_batch)}")
    else:
        print("All tools have been reviewed!")
