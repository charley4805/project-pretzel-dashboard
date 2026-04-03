import os
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()


def _fetch_twitter() -> List[Dict[str, Any]]:
    bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
    if not bearer_token:
        raise ValueError("TWITTER_BEARER_TOKEN not set")
    import tweepy
    client = tweepy.Client(bearer_token=bearer_token)
    username = os.getenv("TWITTER_USERNAME", "projectpretzel")
    user_resp = client.get_user(username=username)
    if not user_resp.data:
        raise ValueError(f"Twitter user @{username} not found")
    tweets = client.get_users_tweets(
        id=user_resp.data.id,
        max_results=10,
        tweet_fields=["created_at", "public_metrics", "text"],
    )
    posts = []
    for t in (tweets.data or []):
        m = t.public_metrics or {}
        posts.append({
            "id": str(t.id),
            "platform": "twitter",
            "text": t.text,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "likes": m.get("like_count", 0),
            "retweets": m.get("retweet_count", 0),
            "replies": m.get("reply_count", 0),
            "url": f"https://x.com/{username}/status/{t.id}",
            "author": f"@{username}",
        })
    return posts


def _fetch_linkedin() -> List[Dict[str, Any]]:
    import requests
    token = os.getenv("LINKEDIN_ACCESS_TOKEN")
    person_urn = os.getenv("LINKEDIN_PERSON_URN")
    if not token or not person_urn:
        raise ValueError("LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN not set")
    headers = {"Authorization": f"Bearer {token}", "X-Restli-Protocol-Version": "2.0.0"}
    resp = requests.get(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=headers,
        params={"q": "authors", "authors": f"List({person_urn})", "count": 10},
        timeout=10,
    )
    resp.raise_for_status()
    import datetime
    posts = []
    for item in resp.json().get("elements", []):
        content = item.get("specificContent", {}).get("com.linkedin.ugc.ShareContent", {})
        text = content.get("shareCommentary", {}).get("text", "")
        stats = item.get("socialDetail", {}).get("totalSocialActivityCounts", {})
        ts = item.get("created", {}).get("time", 0)
        created_at = datetime.datetime.utcfromtimestamp(ts / 1000).isoformat() + "Z" if ts else None
        posts.append({
            "id": item.get("id", ""),
            "platform": "linkedin",
            "text": text,
            "created_at": created_at,
            "likes": stats.get("numLikes", 0),
            "comments": stats.get("numComments", 0),
            "shares": stats.get("numShares", 0),
            "url": f"https://www.linkedin.com/feed/update/{item.get('id', '')}",
            "author": "Project Pretzel",
        })
    return posts


@router.get("/twitter")
async def social_twitter():
    try:
        return _fetch_twitter()
    except Exception:
        return []


@router.get("/linkedin")
async def social_linkedin():
    try:
        return _fetch_linkedin()
    except Exception:
        return []


@router.get("/feed")
async def social_feed():
    twitter: List[Dict[str, Any]] = []
    linkedin: List[Dict[str, Any]] = []
    try:
        twitter = _fetch_twitter()
    except Exception:
        pass
    try:
        linkedin = _fetch_linkedin()
    except Exception:
        pass
    combined = twitter + linkedin
    combined.sort(key=lambda x: x.get("created_at") or "", reverse=True)
    return combined
