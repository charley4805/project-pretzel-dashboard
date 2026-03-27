import os
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter()

MOCK_TWITTER = [
    {"id": "t1", "platform": "twitter", "text": "Just shipped a major update to PretzelKnot — contractors can now sync certifications directly from state licensing boards. Huge time saver. #ContractorTech", "created_at": "2026-03-25T18:30:00Z", "likes": 47, "retweets": 12, "replies": 8, "url": "https://x.com/projectpretzel", "author": "@projectpretzel"},
    {"id": "t2", "platform": "twitter", "text": "The contractor economy is $1.4 trillion and growing. We're building the infrastructure for it.", "created_at": "2026-03-24T14:15:00Z", "likes": 93, "retweets": 28, "replies": 14, "url": "https://x.com/projectpretzel", "author": "@projectpretzel"},
    {"id": "t3", "platform": "twitter", "text": "New milestone: 500 verified contractors on Pretzel.io. From plumbers to electricians to HVAC techs — the network is growing fast.", "created_at": "2026-03-23T10:00:00Z", "likes": 134, "retweets": 45, "replies": 22, "url": "https://x.com/projectpretzel", "author": "@projectpretzel"},
]

MOCK_LINKEDIN = [
    {"id": "l1", "platform": "linkedin", "text": "Excited to share that Project Pretzel has officially launched enterprise contractor management for teams. Multi-contractor dashboards, billing consolidation, and role-based access — all in one place.", "created_at": "2026-03-25T09:00:00Z", "likes": 87, "comments": 14, "shares": 9, "url": "https://linkedin.com/company/projectpretzel", "author": "Project Pretzel"},
    {"id": "l2", "platform": "linkedin", "text": "We asked 200 homeowners: 'What's the #1 frustration when hiring a contractor?' The answer was unanimous: trust. That's why PretzelKnot puts verified reviews and licensing front and center.", "created_at": "2026-03-22T11:30:00Z", "likes": 112, "comments": 31, "shares": 18, "url": "https://linkedin.com/company/projectpretzel", "author": "Project Pretzel"},
]


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
        return MOCK_TWITTER


@router.get("/linkedin")
async def social_linkedin():
    try:
        return _fetch_linkedin()
    except Exception:
        return MOCK_LINKEDIN


@router.get("/feed")
async def social_feed():
    twitter = MOCK_TWITTER
    linkedin = MOCK_LINKEDIN
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
