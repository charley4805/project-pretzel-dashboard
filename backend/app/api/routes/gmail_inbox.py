import os
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

REQUIRED_ENV = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "GMAIL_REFRESH_TOKEN"]

_DISCONNECTED_STATS = {
    "total_unread": 0,
    "support_unread": 0,
    "sales_unread": 0,
    "starred": 0,
    "account": None,
    "connected": False,
    "note": "Configure GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN to connect.",
}


def _build_gmail_service():
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    creds = Credentials(
        token=None,
        refresh_token=os.getenv("GMAIL_REFRESH_TOKEN"),
        client_id=os.getenv("GMAIL_CLIENT_ID"),
        client_secret=os.getenv("GMAIL_CLIENT_SECRET"),
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/gmail.readonly"],
    )
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def _parse_message(msg: Dict[str, Any], category: str) -> Dict[str, Any]:
    headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
    label_ids = msg.get("labelIds", [])
    return {
        "id": msg["id"],
        "from": headers.get("From", ""),
        "subject": headers.get("Subject", "(no subject)"),
        "snippet": msg.get("snippet", ""),
        "unread": "UNREAD" in label_ids,
        "starred": "STARRED" in label_ids,
        "date": headers.get("Date", ""),
        "category": category,
    }


def _fetch_messages(query: str, category: str, max_results: int = 10) -> List[Dict[str, Any]]:
    service = _build_gmail_service()
    resp = service.users().messages().list(userId="me", q=query, maxResults=max_results).execute()
    messages = []
    for item in resp.get("messages", []):
        msg = service.users().messages().get(
            userId="me", id=item["id"], format="metadata",
            metadataHeaders=["From", "Subject", "Date"],
        ).execute()
        messages.append(_parse_message(msg, category))
    return messages


@router.get("/stats")
async def inbox_stats():
    if not all(os.getenv(k) for k in REQUIRED_ENV):
        return _DISCONNECTED_STATS
    try:
        service = _build_gmail_service()
        profile = service.users().getProfile(userId="me").execute()
        unread_resp = service.users().messages().list(userId="me", q="is:unread in:inbox", maxResults=1).execute()
        support_resp = service.users().messages().list(
            userId="me",
            q="is:unread in:inbox (subject:support OR subject:help OR subject:issue OR subject:bug OR subject:problem)",
            maxResults=1,
        ).execute()
        sales_resp = service.users().messages().list(
            userId="me",
            q="is:unread in:inbox (subject:pricing OR subject:demo OR subject:upgrade OR subject:plan OR subject:quote)",
            maxResults=1,
        ).execute()
        return {
            "total_unread": unread_resp.get("resultSizeEstimate", 0),
            "support_unread": support_resp.get("resultSizeEstimate", 0),
            "sales_unread": sales_resp.get("resultSizeEstimate", 0),
            "starred": 0,
            "account": profile.get("emailAddress", ""),
            "connected": True,
            "note": None,
        }
    except Exception as e:
        return {**_DISCONNECTED_STATS, "note": f"Gmail connection error: {str(e)[:120]}"}


@router.get("/support")
async def inbox_support():
    if not all(os.getenv(k) for k in REQUIRED_ENV):
        return []
    try:
        return _fetch_messages(
            query="in:inbox (subject:support OR subject:help OR subject:issue OR subject:bug OR subject:problem)",
            category="support",
        )
    except Exception:
        return []


@router.get("/sales")
async def inbox_sales():
    if not all(os.getenv(k) for k in REQUIRED_ENV):
        return []
    try:
        return _fetch_messages(
            query="in:inbox (subject:pricing OR subject:demo OR subject:upgrade OR subject:plan OR subject:quote OR subject:partnership)",
            category="sales",
        )
    except Exception:
        return []
