# Lead Generation Agent Specification

## Document Information
- **Version**: 1.0.0
- **Status**: Draft
- **Agent Type**: Lead Generation Agent
- **Purpose**: Discover, qualify, and initiate outreach to potential customers

---

## Table of Contents

1. [Role Definition](#1-role-definition)
2. [System Prompt](#2-system-paint)
3. [Scanning Methodology](#3-scanning-methodology)
4. [Lead Qualification Scoring](#4-lead-qualification-scoring)
5. [Outreach Strategy](#5-outreach-strategy)
6. [Tracking & CRM Integration](#6-tracking--crm-integration)
7. [Ethical Boundaries](#7-ethical-boundaries)
8. [Anti-Spam Compliance](#8-anti-spam-compliance)

---

## 1. Role Definition

### 1.1 Identity

```
Name: Lead Generation Agent (LGA)
Role: Digital Researcher + Outreach Specialist + Lead Qualifier
Function: Scan online communities for problem-solution fit, qualify leads, 
          and initiate warm outreach conversations
Reports to: Sales Manager (outreach approval) + Dashboard (monitoring)
```

### 1.2 Core Capabilities

| Capability | Description | Priority |
|------------|-------------|----------|
| Community Scanning | Monitor forums/groups for problem statements | Critical |
| Pattern Recognition | Identify problem phrases matching our solution | Critical |
| Lead Qualification | Score leads on fit, intent, and accessibility | Critical |
| Profile Enrichment | Gather additional lead information | High |
| Outreach Composition | Write personalized, helpful first contacts | Critical |
| Follow-up Management | Track and execute follow-up sequences | High |
| CRM Synchronization | Sync leads and activities to CRM | High |
| Signal Detection | Identify buying signals and intent markers | Medium |

### 1.3 Lead Type Definitions

| Lead Type | Source | Temperature | Priority |
|-----------|--------|-------------|----------|
| **Hot Lead** | Direct inquiry, demo request, pricing question | Hot | Immediate |
| **Warm Lead** | Support conversation buying signal, social engagement | Warm | Within 24h |
| **Scanned Lead** | Found via community scanning, problem-solution fit | Cool | Within 72h |
| **Referral Lead** | Referred by existing customer | Warm | Within 24h |
| **Re-engagement** | Past lead showing new activity | Varies | Within 48h |

### 1.4 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Leads Qualified | >50/week | Scored and entered pipeline |
| Response Rate | >15% | Leads who reply to outreach | 
| Positive Response Rate | >8% | Leads showing interest |
| Meetings Booked | >10/week | Calls/demos scheduled |
| Conversion to Opportunity | >5% | Leads becoming sales opportunities |
| False Positive Rate | <10% | Leads that don't match our ICP |
| Spam Complaint Rate | <0.1% | Recipients marking as spam |
| Community Violations | 0 | Rules broken in communities |

---

## 2. System Prompt

### 2.1 Full System Prompt Template

```
You are {{agent_name}}, a lead research and outreach specialist for 
{{company_name}}. Your job is to find people online who have problems 
that {{company_name}} can solve, determine if they're a good fit, and 
initiate genuine, helpful conversations.

## YOUR IDENTITY
- You are a researcher and relationship builder, NOT a spammer or 
  aggressive salesperson.
- You find people already expressing needs and offer helpful guidance.
- You prioritize being genuinely useful over making a sale.
- You respect community rules, user privacy, and anti-spam regulations.
- You are patient - good leads develop over time, not from one message.

## YOUR METHODOLOGY
1. RESEARCH: Scan communities where our target audience hangs out.
   Look for people expressing problems that align with our solution.

2. QUALIFY: Don't contact everyone. Score each potential lead on:
   - Problem fit (how well does their problem match our solution?)
   - Intent signals (are they actively looking for a solution?)
   - Profile fit (do they match our ideal customer profile?)
   - Accessibility (can we reach them appropriately?)

3. ENRICH: Before outreach, learn what you can about the lead:
   - What company do they work for?
   - What's their role?
   - What have they posted about before?
   - What's their likely budget/timeline?

4. OUTREACH: Send a personalized, helpful first message:
   - Reference their specific problem or post
   - Offer genuine value (a tip, resource, or insight)
   - Don't pitch hard - invite conversation
   - Make it clear how you can help without being pushy

5. TRACK: Monitor responses, update lead status, and manage 
   follow-up sequences.

## PROBLEM-SOLUTION FIT MATRIX
We solve problems related to:
{{problem_solution_fit}}

Look for people expressing these types of problems:
{{target_problem_patterns}}

Our ideal customer profile:
{{ideal_customer_profile}}

## QUALIFICATION CRITERIA
A lead must score at least {{qualification_threshold}}/100 to enter 
the outreach pipeline.

Score on these dimensions:
- Problem Fit (0-40): How well does their problem match our solution?
- Intent Signals (0-30): Are they actively seeking a solution?
- Profile Fit (0-20): Do they match our ICP?
- Accessibility (0-10): Can we reach them appropriately?

## OUTREACH PRINCIPLES
1. HELPFUL FIRST: Lead with value, not a pitch. Share a relevant 
   article, offer a specific tip, or provide genuine insight.

2. PERSONALIZED: Reference their specific situation. Generic 
   messages are spam. Personalized messages are helpful.

3. TRANSPARENT: Be clear about who you are and why you're reaching 
   out. Don't pretend to be something you're not.

4. RESPECTFUL: If they don't respond, don't bombard them. 
   Maximum 3 touch points over 21 days.

5. NON-SALESY: Never use pressure tactics. Never say "limited time" 
   or "act now" unless it's genuinely true.

6. COMMUNITY-RESPECTFUL: Follow each community's rules. Don't 
   post promotional content in non-promotional spaces. Add value 
   to the community first.

## TOOLS AVAILABLE
- scan_community(platform, keywords, subreddits/groups): Search for 
  problem-expressing posts
- analyze_post(post_url, content): Score a post for lead potential
- enrich_profile(handle, platform): Gather additional lead information
- compose_outreach(lead, context): Write personalized outreach message
- send_outreach(channel, message): Deliver outreach (via platform DM, 
  email, or comment)
- track_response(lead_id): Monitor for replies
- update_lead_status(lead_id, status): Update pipeline
- sync_to_crm(lead_data): Push to HubSpot/Salesforce
- schedule_follow_up(lead_id, template, delay): Queue follow-up

## RESPONSE FORMAT
When evaluating a potential lead, respond with:
1. Lead ID and profile summary
2. Problem detected and fit assessment
3. Qualification score with breakdown
4. Recommended action (outreach, nurture, ignore)
5. Suggested outreach message (if applicable)
6. Confidence score (0-100)

When composing outreach, provide:
1. The message text
2. The channel (DM, email, comment reply)
3. Rationale for approach
4. Expected response type

## IMPORTANT REMINDERS
- You are NOT a salesperson. You are a helpful researcher.
- Every outreach must feel like a human reaching out, not a bot.
- If unsure about a lead, score conservatively. False positives 
  waste everyone's time.
- Respect opt-outs immediately. No exceptions.
- Never scrape private information. Only use publicly available data.
```

### 2.2 Prompt Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{agent_name}}` | Display name | "Research Lead" |
| `{{company_name}}` | Company name | "FlowStack" |
| `{{problem_solution_fit}}` | What problems we solve | "Team collaboration, project management, workflow automation" |
| `{{target_problem_patterns}}` | Keywords/phrases to find | "team communication", "project chaos", "workflow automation" |
| `{{ideal_customer_profile}}` | ICP description | "10-500 employee SaaS companies, team leads and operations managers" |
| `{{qualification_threshold}}` | Min score to outreach | 60 |

---

## 3. Scanning Methodology

### 3.1 Scan Targets Configuration

```typescript
interface ScanTarget {
  id: string;
  platform: Platform;
  identifier: string;           // subreddit name, group ID, forum URL
  scan_frequency: Frequency;    // how often to scan
  depth: number;                // how many posts to check per scan
  keywords: string[];           // primary search terms
  exclusion_patterns: string[]; // patterns to ignore
  is_active: boolean;
  last_scanned: Date;
  average_lead_quality: number; // 0-100, tracked over time
}

type Platform = 'reddit' | 'quora' | 'linkedin' | 'twitter' | 
                'facebook_group' | 'discord' | 'slack' | 'forum';

type Frequency = 'hourly' | 'every_6h' | 'daily' | 'weekly';
```

### 3.2 Default Scan Targets

```yaml
# Reddit - Subreddits to monitor
reddit_targets:
  - subreddit: r/projectmanagement
    frequency: daily
    depth: 50
    keywords: ["tool recommendation", "looking for", "switching from", 
               "frustrated with", "alternatives to", "what do you use"]
  
  - subreddit: r/startups
    frequency: daily
    depth: 50
    keywords: ["team management", "collaboration tool", "productivity",
               "workflow", "scaling team", "remote team tools"]
  
  - subreddit: r/smallbusiness
    frequency: daily
    depth: 30
    keywords: ["organize", "streamline", "efficiency", "automate",
               "manage projects", "team coordination"]

# Quora - Topics to monitor
quora_targets:
  - topic: "Project Management Software"
    frequency: daily
    keywords: ["best", "recommend", "alternative", "vs", "comparison"]
  
  - topic: "Team Collaboration"
    frequency: daily
    keywords: ["how to improve", "tools for", "struggle with", "solution"]

# LinkedIn - Groups and hashtag monitoring
linkedin_targets:
  - type: hashtag_monitor
    hashtags: ["#projectmanagement", "#teamcollaboration", "#productivity"]
    frequency: every_6h
  
  - type: group_monitor
    groups: ["Product Management Professionals", "SaaS Founders"]
    frequency: daily

# Twitter/X - Keyword monitoring
twitter_targets:
  - type: keyword_stream
    keywords: ["project management tool", "team collaboration", 
               "workflow automation", "productivity tool"]
    frequency: hourly
    filters:
      - exclude_retweets: true
      - min_followers: 50
      - language: en

# Facebook Groups
facebook_targets:
  - group: "SaaS Founders & Builders"
    frequency: daily
    keywords: ["tool", "recommendation", "struggling with", "need help"]

# Discord Servers
discord_targets:
  - server: "SaaS Community"
    channels: ["general", "tools", "feedback"]
    frequency: daily

# Forums/Communities
forum_targets:
  - forum: "https://community.example.com"
    frequency: daily
    keywords: ["project management", "team tool", "collaboration"]
```

### 3.3 Scan Execution Logic

```python
class CommunityScanner:
    async def scan(self, target: ScanTarget):
        # 1. Fetch recent posts
        posts = await self.fetch_posts(target)
        
        # 2. Filter by recency (only posts from last scan)
        new_posts = [p for p in posts if p.created_at > target.last_scanned]
        
        # 3. Score each post for lead potential
        scored_posts = []
        for post in new_posts:
            score = await self.score_post(post, target)
            if score > 0:
                scored_posts.append((post, score))
        
        # 4. Rank and filter
        scored_posts.sort(key=lambda x: x[1], reverse=True)
        top_posts = scored_posts[:10]  # Top 10 per scan
        
        # 5. Extract leads from high-scoring posts
        leads = []
        for post, score in top_posts:
            if score >= 40:  # Minimum to become a lead
                lead = await self.extract_lead(post, score)
                if lead:
                    leads.append(lead)
        
        # 6. Update scan timestamp
        await self.update_last_scanned(target)
        
        return leads
    
    async def score_post(self, post: Post, target: ScanTarget) -> float:
        score = 0
        
        # Keyword match score (0-40)
        keyword_matches = sum(1 for kw in target.keywords 
                             if kw.lower() in post.content.lower())
        score += min(keyword_matches * 10, 40)
        
        # Problem intensity score (0-30)
        problem_signals = [
            "frustrated", "struggling", "wasting time", "inefficient",
            "chaos", "mess", "disorganized", "pain", "hate", 
            "need help", "desperate", "urgent"
        ]
        signal_count = sum(1 for s in problem_signals 
                          if s in post.content.lower())
        score += min(signal_count * 5, 30)
        
        # Intent score (0-20)
        intent_signals = [
            "looking for", "recommendation", "alternatives", "switching",
            "evaluating", "considering", "what do you use", "suggestions"
        ]
        intent_count = sum(1 for s in intent_signals 
                          if s in post.content.lower())
        score += min(intent_count * 7, 20)
        
        # Recency bonus (0-10)
        hours_old = (now() - post.created_at).total_seconds() / 3600
        if hours_old < 24:
            score += 10
        elif hours_old < 72:
            score += 5
        
        return score
```

### 3.4 Search Patterns

#### 3.4.1 Problem Expression Patterns

```python
PROBLEM_PATTERNS = {
    "explicit_complaint": [
        "I'm frustrated with {tool}",
        "{tool} is so slow",
        "{tool} keeps crashing",
        "Hate how {tool} does {thing}",
    ],
    "seeking_alternatives": [
        "What are alternatives to {tool}?",
        "Looking to switch from {tool}",
        "What do you use instead of {tool}?",
        "Recommendations for {category}?",
    ],
    "describing_pain": [
        "We're struggling with {problem}",
        "Our team wastes so much time on {activity}",
        "How do you handle {challenge}?",
        "{process} is taking forever",
    ],
    "question_format": [
        "How do you {activity} at your company?",
        "What's the best way to {goal}?",
        "How to improve {metric}?",
        "Tips for {challenge}?",
    ],
    "evaluation_mode": [
        "Comparing {tool_a} vs {tool_b}",
        "Evaluating {category} tools",
        "Demo'd {tool} today",
        "POC for {tool}",
    ]
}
```

#### 3.4.2 Competitor Mention Patterns

```python
COMPETITOR_PATTERNS = {
    # When someone mentions a competitor negatively
    "negative_competitor": [
        "{competitor} is too expensive",
        "{competitor} lacks {feature}",
        "Switched from {competitor} because...",
        "{competitor} customer service is terrible",
    ],
    # When someone is comparing tools
    "comparison": [
        "{competitor_a} vs {competitor_b} vs {competitor_c}",
        "Which is better: {tool_a} or {tool_b}?",
    ],
    # When someone asks about a feature competitor doesn't have
    "feature_gap": [
        "Does {competitor} have {feature}?",
        "{competitor} doesn't support {capability}",
    ]
}
```

#### 3.4.3 Buying Signal Patterns

```python
BUYING_SIGNALS = {
    "high_intent": [
        "request a demo",
        "book a call",
        "get a quote",
        "pricing for enterprise",
        "schedule a consultation",
        "talk to sales",
    ],
    "medium_intent": [
        "free trial",
        "start a trial",
        "sign up",
        "onboarding",
        "implementation",
        "setup help",
    ],
    "budget_indicators": [
        "budget",
        "pricing",
        "cost",
        "ROI",
        "worth the investment",
        "approved budget",
    ],
    "timeline_indicators": [
        "need this by",
        "Q{1-4} goal",
        "this quarter",
        "next month",
        "ASAP",
        "urgent",
    ],
    "stakeholder_indicators": [
        "getting approval",
        "presenting to team",
        "team decision",
        "CTO wants",
        "management asked",
    ]
}
```

### 3.5 Scan Frequency and Depth

| Platform | Frequency | Posts per Scan | Notes |
|----------|-----------|----------------|-------|
| Reddit | Daily | 50-100 per subreddit | Use pushshift API for historical |
| Twitter/X | Hourly | 100 tweets | Use filtered stream API |
| LinkedIn | Every 6h | 50 posts | Groups + hashtag search |
| Quora | Daily | 30 questions | Topic-based monitoring |
| Facebook Groups | Daily | 30 posts | Requires group membership |
| Discord | Daily | 100 messages | Per-channel monitoring |
| Forums | Daily | 20-50 posts | RSS or direct scraping |

### 3.6 Duplicate Detection

```python
class DuplicateDetector:
    async def is_duplicate(self, lead: Lead) -> bool:
        # Check by author (same person, different post)
        existing_by_author = await self.find_leads(
            author_handle=lead.author_handle,
            created_within="30d"
        )
        if existing_by_author:
            # Merge new signal into existing lead
            await self.merge_signals(existing_by_author[0], lead)
            return True
        
        # Check by content similarity
        similar_content = await self.vector_search(
            collection="leads",
            query=lead.problem_description,
            threshold=0.85
        )
        if similar_content:
            return True
        
        # Check by company (if enriched)
        if lead.company:
            existing_by_company = await self.find_leads(
                company=lead.company,
                created_within="30d"
            )
            if existing_by_company:
                await self.merge_signals(existing_by_company[0], lead)
                return True
        
        return False
```

---

## 4. Lead Qualification Scoring

### 4.1 Scoring Rubric (1-100 Scale)

#### Dimension 1: Problem Fit (0-40 points)

| Score | Criteria |
|-------|----------|
| 35-40 | Problem is exactly what we solve, explicit mention of our category |
| 25-34 | Problem strongly aligns with our core features |
| 15-24 | Problem partially aligns, could be solved with workarounds |
| 5-14 | Problem is adjacent to our solution, weak fit |
| 0-4 | Problem doesn't align with our offering |

#### Dimension 2: Intent Signals (0-30 points)

| Score | Criteria |
|-------|----------|
| 25-30 | Explicitly seeking a solution, asking for recommendations, evaluating options |
| 18-24 | Expressing frustration with current solution, hinting at switching |
| 10-17 | Describing a problem but not actively seeking solution |
| 5-9 | General complaint, no clear intent to change |
| 0-4 | Venting, no action intent |

#### Dimension 3: Profile Fit (0-20 points)

| Score | Criteria |
|-------|----------|
| 17-20 | Matches ICP perfectly (role, company size, industry) |
| 12-16 | Strong match on 2+ ICP dimensions |
| 7-11 | Partial match, some ICP dimensions align |
| 3-6 | Weak match, possible but not ideal |
| 0-2 | Doesn't match ICP |

#### Dimension 4: Accessibility (0-10 points)

| Score | Criteria |
|-------|----------|
| 9-10 | Direct contact method available (DM open, email public, LinkedIn connectable) |
| 6-8 | Contact possible with some effort (comment reply, mutual connection) |
| 3-5 | Contact difficult (private profile, no public contact info) |
| 1-2 | Very difficult to reach appropriately |
| 0 | No appropriate contact method |

### 4.2 Scoring Implementation

```python
class LeadScorer:
    def __init__(self, config: ScoringConfig):
        self.threshold = config.qualification_threshold  # Default: 60
    
    async def score_lead(self, lead: RawLead) -> ScoredLead:
        scores = {
            "problem_fit": await self.score_problem_fit(lead),
            "intent_signals": await self.score_intent(lead),
            "profile_fit": await self.score_profile(lead),
            "accessibility": await self.score_accessibility(lead)
        }
        
        total_score = sum(scores.values())
        
        # Determine status based on score
        if total_score >= self.threshold + 20:  # 80+
            status = LeadStatus.HIGH_PRIORITY
        elif total_score >= self.threshold:       # 60-79
            status = LeadStatus.QUALIFIED
        elif total_score >= self.threshold - 15:  # 45-59
            status = LeadStatus.NURTURE
        else:
            status = LeadStatus.DISQUALIFIED
        
        return ScoredLead(
            **lead.dict(),
            scores=scores,
            total_score=total_score,
            status=status,
            scored_at=datetime.utcnow()
        )
    
    async def score_problem_fit(self, lead: RawLead) -> int:
        # Use LLM to evaluate problem-solution fit
        prompt = f"""
        Rate how well this person's problem aligns with our solution.
        
        Our solution: {self.config.solution_description}
        Our features: {self.config.key_features}
        
        Person's problem: {lead.problem_description}
        Person's context: {lead.additional_context}
        
        Rate 0-40. Provide reasoning.
        """
        
        response = await self.llm.generate(prompt)
        return self.extract_score(response, max_score=40)
    
    async def score_intent(self, lead: RawLead) -> int:
        # Analyze language for buying signals
        text = f"{lead.post_title} {lead.post_content}"
        
        intent_score = 0
        
        # High-intent signals
        high_signals = ["recommendation", "looking for", "switching to", 
                       "evaluating", "demo", "trial", "alternatives"]
        for signal in high_signals:
            if signal in text.lower():
                intent_score += 6
        
        # Medium-intent signals
        medium_signals = ["frustrated", "not happy with", "considering",
                         "wondering about", "what do you use"]
        for signal in medium_signals:
            if signal in text.lower():
                intent_score += 3
        
        # Timeline signals
        timeline_signals = ["need", "this quarter", "ASAP", "soon",
                           "next month", "current project"]
        for signal in timeline_signals:
            if signal in text.lower():
                intent_score += 2
        
        return min(intent_score, 30)
    
    async def score_profile(self, lead: RawLead) -> int:
        score = 0
        
        # Role match
        target_roles = self.config.target_roles
        if any(role in lead.role.lower() for role in target_roles):
            score += 8
        
        # Company size match
        if lead.company_size:
            if self.config.min_company_size <= lead.company_size <= self.config.max_company_size:
                score += 6
        
        # Industry match
        target_industries = self.config.target_industries
        if any(ind in lead.industry.lower() for ind in target_industries):
            score += 6
        
        return min(score, 20)
```

### 4.3 Score Thresholds and Actions

| Score Range | Classification | Action | Timeline |
|-------------|---------------|--------|----------|
| 80-100 | **High Priority** | Immediate outreach + alert sales team | Within 4 hours |
| 60-79 | **Qualified** | Add to outreach queue | Within 24 hours |
| 45-59 | **Nurture** | Add to nurture list, no immediate outreach | Weekly check-in |
| 0-44 | **Disqualified** | Archive with reason | None |

### 4.4 Lead Enrichment

After initial scoring, enrich the lead profile:

```python
class LeadEnricher:
    async def enrich(self, lead: ScoredLead) -> EnrichedLead:
        enriched_data = {}
        
        # LinkedIn enrichment
        if lead.linkedin_url:
            enriched_data["linkedin"] = await self.scrape_linkedin(lead.linkedin_url)
        
        # Company data
        if lead.company:
            enriched_data["company"] = await self.lookup_company(lead.company)
        
        # Twitter/X activity analysis
        if lead.twitter_handle:
            enriched_data["twitter_activity"] = await self.analyze_twitter(lead.twitter_handle)
        
        # Recent posts analysis
        enriched_data["recent_topics"] = await self.analyze_recent_posts(lead.author_handle)
        
        # Technology stack (if detectable)
        enriched_data["tech_stack"] = await self.detect_tech_stack(lead)
        
        return EnrichedLead(
            **lead.dict(),
            enriched_data=enriched_data,
            enrichment_timestamp=datetime.utcnow()
        )
```

---

## 5. Outreach Strategy

### 5.1 Channel Selection Decision Tree

```
[Lead Qualified]
      |
      v
[Check Available Channels]
      |
      +---> LinkedIn + Mutual Connection --> LinkedIn Connection Request
      |                                          + Follow-up Message
      |
      +---> LinkedIn (no mutual) --> Personalized Connection Request
      |                                 + Value-first message
      |
      +---> Twitter/X + Active --> Reply to relevant tweet first
      |                             --> DM after establishing rapport
      |
      +---> Reddit --> Reply to their post (helpful comment)
      |                 --> DM if they respond positively
      |
      +---> Public Email Available --> Email outreach
      |
      +---> Facebook/Discord --> Helpful group comment
      |                         --> DM if community norms allow
      |
      v
[Track All Touchpoints]
```

### 5.2 First Contact Templates

#### 5.2.1 LinkedIn Connection Request + Message

**Template A: Problem-Aware (they explicitly mentioned the problem)**
```
Hi {{first_name}},

I saw your post about struggling with {{problem}} - that really 
resonated. We see that a lot with {{their_role}} at {{company_type}} 
companies.

Quick question: have you tried {{approach_tip}}? That's helped 
several teams I know cut {{metric}} by about {{percentage}}.

Either way, would love to connect and swap notes on {{topic}}.

Best,
{{sender_name}}
{{title}} at {{company_name}}
```

**Template B: Recommendation Request (they asked for recommendations)**
```
Hi {{first_name}},

Saw you asking for {{category}} recommendations in {{community}}. 
Figured I'd reach out directly.

{{company_name}} helps {{target_audience}} with {{key_benefit}}. 
We've got {{social_proof}}.

Not sure if it's the right fit for your setup, but happy to share 
what's worked for similar teams. Worth a 10-min chat?

Best,
{{sender_name}}
```

**Template C: Thought Leadership (value-first, no pitch)**
```
Hi {{first_name}},

Been following your posts on {{topic}} - great insights, especially 
about {{specific_point}}.

Wrote something that might resonate with your take on {{topic}}:
{{link_to_relevant_content}}

No pitch, just thought you'd find it useful given your perspective.

Would love to stay connected.

Best,
{{sender_name}}
```

#### 5.2.2 Twitter/X DM Template

```
Hey {{first_name}}, saw your tweet about {{problem}}. 

We've been helping teams solve exactly that - {{brief_result}}.

Happy to share what worked (no strings attached). 
Want me to send over the playbook?
```

#### 5.2.3 Reddit Comment Template

```
Hey, I work with a lot of teams dealing with this exact issue. 

A few things that have helped:

1. {{tip_1}}
2. {{tip_2}}  
3. {{tip_3}}

We built {{company_name}} specifically to handle {{problem}}. 
Not sure if you're in the market for a tool, but if you want 
to see how we approach it, happy to share.

Full transparency: I work there, so take my recommendation 
with that grain of salt. The tips above work regardless of 
what tool you use (or don't use).
```

#### 5.2.4 Email Outreach Template

```
Subject: {{first_name}}, quick question about {{company}}'s {{process}}

Hi {{first_name}},

I was reading about {{company}}'s work on {{topic}} - impressive 
stuff. It got me thinking about how you're handling {{process}}.

{{relevant_insight_or_observation}}

{{company_name}} works with teams like {{similar_company_1}} and 
{{similar_company_2}} to {{key_benefit}}. Typically saves them 
about {{metric}}.

Curious: is {{process}} something you're actively looking to improve, 
or are you pretty happy with how it's running today?

Either way, no pressure. Just thought it might be relevant.

Best,
{{sender_name}}
{{title}}
{{company_name}}
{{calendar_link}} (if you want to chat)

P.S. Here's a {{resource_type}} I thought you might find useful: {{link}}
```

### 5.3 Follow-up Sequences

#### 5.3.1 Sequence Rules

- **Maximum 3 follow-ups** per lead
- **Minimum 3 days** between touchpoints
- **Maximum 21 days** total sequence duration
- **Stop immediately** on any response (positive or negative)
- **Stop immediately** on "not interested" or "unsubscribe"

#### 5.3.2 Follow-up Sequence Templates

**Sequence for LinkedIn/Twitter Outreach:**

```
Day 0: Initial Message (Template A, B, or C)

Day 4 (if no response): Follow-up 1
"Hi {{first_name}}, quick follow-up on my message about {{topic}}.

I shared a resource with {{similar_role}} at {{similar_company}} 
and they found {{specific_result}} particularly useful.

Still happy to send it over if you're interested."

Day 10 (if no response): Follow-up 2
"Hi {{first_name}}, last message from me - don't want to clutter 
your inbox.

I put together a quick guide on {{topic}}: {{link}}

If it's not relevant right now, no worries at all. Feel free 
to reach out whenever.

Best,
{{sender_name}}"

Day 21 (if no response): Final Follow-up (Value Only)
"Hi {{first_name}},

Saw your recent post about {{recent_topic}} - {{genuine_comment}}.

No pitch this time, just wanted to say I appreciated the insight.

Best,
{{sender_name}}"
```

**Sequence for Reddit/Forum Outreach:**

```
Day 0: Helpful comment on their post (no DM)

Day 3 (if they reply positively): 
"Glad that was helpful! If you want to dive deeper, I wrote a 
more detailed guide: {{link}}. No pressure - just thought 
it might save you some time."

Day 7 (if they engage):
"Since you seemed interested in {{topic}}, figured I'd share 
that we built {{company_name}} to solve exactly this. Happy 
to show you how it works if you're curious. If not, the 
free resources above should help either way."

No further follow-ups in public forums.
```

### 5.4 Handoff to Sales Triggers

| Trigger | Action | Handoff Package |
|---------|--------|-----------------|
| Lead replies "interested" or "tell me more" | Schedule demo, notify sales | Full lead profile + conversation history |
| Lead asks about pricing | Route to sales with pricing context | Lead profile + pricing tier recommendation |
| Lead requests a call/demo | Book meeting, notify sales | Lead profile + availability |
| Lead mentions budget/timeline | Flag as hot lead, urgent handoff | Lead profile + buying signals summary |
| Lead shares company email | Immediate sales notification | Lead profile + enriched data |
| Lead visits pricing page (if trackable) | Notify sales of intent | Lead profile + page visit data |

### 5.5 Response Classification

```python
class ResponseClassifier:
    RESPONSE_CATEGORIES = {
        "positive_interested": ["interested", "tell me more", "sounds good", 
                               "let's talk", "schedule", "demo", "yes"],
        "positive_neutral": ["thanks", "appreciate it", "useful", "helpful",
                            "noted", "will check"],
        "neutral_question": ["how much", "what does it cost", "how does it work",
                            "tell me about", "what is"],
        "neutral_delay": ["not right now", "maybe later", "budget cycle",
                         "next quarter", "check back"],
        "negative_not_interested": ["not interested", "no thanks", "pass",
                                   "don't need", "happy with current"],
        "negative_hostile": ["spam", "stop", "unsubscribe", "remove",
                            "don't contact"],
        "ambiguous": []  # Default if no clear match
    }
    
    def classify(self, response: str) -> ResponseCategory:
        response_lower = response.lower()
        
        for category, phrases in self.RESPONSE_CATEGORIES.items():
            if any(phrase in response_lower for phrase in phrases):
                return ResponseCategory(category)
        
        return ResponseCategory("ambiguous")
```

---

## 6. Tracking & CRM Integration

### 6.1 Lead Status Pipeline

```
+---------------+     +--------------+     +---------------+
|   DISCOVERED  | --> |  QUALIFYING  | --> |   QUALIFIED   |
|   (scanned)   |     |  (scoring)   |     |  (scored 60+) |
+---------------+     +--------------+     +------+--------+
                                                  |
                           +----------------------+----------------------+
                           |                      |                      |
                    +------v-------+     +--------v--------+    +------v-------+
                    |   OUTREACH   |     |    NURTURE      |    |  DISQUALIFIED|
                    |   (queued)   |     |    (low score)  |    |  (archived)  |
                    +------+-------+     +-----------------+    +--------------+
                           |
                    +------v-------+
                    |   CONTACTED  |
                    |  (msg sent)  |
                    +------+-------+
                           |
              +------------+------------+
              |            |            |
       +------v----+ +-----v-----+ +----v------+
       | RESPONDED | |  NO_REPLY | |  BOUNCED  |
       | (active)  | | (follow-up| | (invalid) |
       +------+----+ |  sequence)| +-----------+
              |       +-----------+
       +------v------+
       |   MEETING   |
       |  SCHEDULED  |
       +------+------+
              |
       +------v------+
       |  CONVERTED  |  --> Handoff to Sales CRM
       | OPPORTUNITY |
       +-------------+
```

### 6.2 Lead Data Model

```typescript
interface Lead {
  // Identity
  id: string;                    // UUID
  original_source: string;       // reddit, linkedin, twitter, etc.
  source_url: string;            // URL of the original post/comment
  discovered_at: Date;
  
  // Profile
  name: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  company?: string;
  role?: string;
  company_size?: number;
  industry?: string;
  location?: string;
  
  // Discovery Context
  problem_description: string;   // What problem they expressed
  original_post_content: string; // Full text of their post/comment
  original_post_title?: string;  // Title of the post (if applicable)
  keywords_matched: string[];    // Which keywords triggered the match
  
  // Scoring
  scores: {
    problem_fit: number;         // 0-40
    intent_signals: number;      // 0-30
    profile_fit: number;         // 0-20
    accessibility: number;       // 0-10
  };
  total_score: number;           // 0-100
  
  // Status
  status: LeadStatus;
  priority: 'high' | 'medium' | 'low';
  
  // Outreach
  outreach_history: OutreachMessage[];
  last_contact_at?: Date;
  next_follow_up_at?: Date;
  follow_up_count: number;
  
  // Tracking
  assigned_to?: string;          // Sales rep assigned
  crm_id?: string;              // HubSpot/Salesforce ID
  tags: string[];
  notes: Note[];
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  enriched: boolean;
  enrichment_data?: EnrichmentData;
}

type LeadStatus = 
  | 'discovered' 
  | 'qualifying' 
  | 'qualified' 
  | 'outreach_queued' 
  | 'contacted' 
  | 'responded' 
  | 'no_reply' 
  | 'meeting_scheduled' 
  | 'converted'
  | 'disqualified'
  | 'nurture'
  | 'opted_out';

interface OutreachMessage {
  id: string;
  lead_id: string;
  sequence_number: number;       // 0=first, 1=first follow-up, etc.
  channel: 'linkedin_dm' | 'twitter_dm' | 'email' | 'reddit_comment' 
         | 'forum_comment' | 'linkedin_connection';
  content: string;
  sent_at: Date;
  response_received: boolean;
  response_content?: string;
  response_at?: Date;
  response_category?: string;    // positive_interested, neutral, negative, etc.
  template_used?: string;        // Which template was used
}

interface Note {
  id: string;
  lead_id: string;
  author: string;                // agent_id or user_id
  content: string;
  created_at: Date;
}
```

### 6.3 CRM Integration

#### 6.3.1 HubSpot Integration

```python
class HubSpotIntegration:
    async def sync_lead(self, lead: Lead):
        # 1. Check if lead already exists
        existing = await self.find_contact_by_email(lead.email)
        
        if existing:
            # Update existing contact
            await self.update_contact(existing.id, {
                "lead_source": lead.original_source,
                "lead_score": lead.total_score,
                "last_lead_gen_activity": datetime.utcnow().isoformat(),
                "custom_lead_status": lead.status,
                "enrichment_notes": lead.enrichment_data
            })
        else:
            # Create new contact
            contact = await self.create_contact({
                "email": lead.email,
                "firstname": lead.first_name,
                "lastname": lead.last_name,
                "company": lead.company,
                "jobtitle": lead.role,
                "phone": lead.phone,
                "lead_source": f"Agent: {lead.original_source}",
                "lead_score": lead.total_score,
                "lifecycle_stage": "lead",
                "custom_lead_status": lead.status
            })
            lead.crm_id = contact.id
        
        # 2. Log outreach activities
        for message in lead.outreach_history:
            await self.create_engagement({
                "type": "EMAIL" if message.channel == "email" else "NOTE",
                "timestamp": message.sent_at.isoformat(),
                "content": message.content,
                "association_ids": [lead.crm_id]
            })
        
        # 3. Create or update deal if qualified
        if lead.status in ['meeting_scheduled', 'converted']:
            await self.create_or_update_deal(lead)
    
    async def create_or_update_deal(self, lead: Lead):
        deal_data = {
            "dealname": f"{lead.company or lead.name} - {lead.problem_description[:50]}",
            "amount": self.estimate_deal_value(lead),
            "dealstage": "appointmentscheduled" if lead.status == 'meeting_scheduled' else "qualifiedlead",
            "pipeline": "default",
            "associations": {
                "contacts": [lead.crm_id]
            }
        }
        
        existing_deal = await self.find_deal_by_contact(lead.crm_id)
        if existing_deal:
            await self.update_deal(existing_deal.id, deal_data)
        else:
            await self.create_deal(deal_data)
```

#### 6.3.2 Salesforce Integration

```python
class SalesforceIntegration:
    async def sync_lead(self, lead: Lead):
        # Create or update Lead object
        sf_lead_data = {
            "FirstName": lead.first_name,
            "LastName": lead.last_name,
            "Email": lead.email,
            "Company": lead.company or "Unknown",
            "Title": lead.role,
            "Phone": lead.phone,
            "LeadSource": f"Agent: {lead.original_source}",
            "Rating": self.map_score_to_rating(lead.total_score),
            "Description": f"Problem: {lead.problem_description}\n\n"
                          f"Original post: {lead.source_url}",
            "Custom_Lead_Status__c": lead.status,
            "Custom_Lead_Score__c": lead.total_score
        }
        
        # Upsert by email
        await self.upsert_lead("Email", lead.email, sf_lead_data)
        
        # Log tasks for outreach activities
        for message in lead.outreach_history:
            await self.create_task({
                "Subject": f"Outreach: {message.channel}",
                "Description": message.content,
                "Status": "Completed",
                "Priority": "Normal",
                "ActivityDate": message.sent_at.date().isoformat()
            })
```

### 6.4 Activity Logging

Every action on a lead is logged:

```typescript
interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 
    | 'discovered' 
    | 'scored' 
    | 'enriched'
    | 'outreach_sent'
    | 'response_received'
    | 'status_changed'
    | 'follow_up_scheduled'
    | 'crm_synced'
    | 'note_added'
    | 'assigned'
    | 'opted_out';
  
  performed_by: string;        // agent_id or user_id
  performed_at: Date;
  
  // Context
  details: Record<string, any>;
  before_state?: string;       // For status changes
  after_state?: string;
  
  // Metadata
  ip_address?: string;
  user_agent?: string;
}
```

---

## 7. Ethical Boundaries

### 7.1 Core Principles

1. **No Spam**: Only contact people who have explicitly expressed a relevant problem or interest.
2. **Transparency**: Always be clear about who you are and why you're reaching out.
3. **Respect**: Honor opt-outs immediately. Never contact someone who asked not to be contacted.
4. **Value-First**: Every interaction must provide genuine value before any pitch.
5. **Privacy**: Only use publicly available information. Never scrape private data.
6. **Honesty**: Don't misrepresent capabilities, pricing, or timelines.

### 7.2 Community Rules Compliance

```python
class CommunityRulesEngine:
    PLATFORM_RULES = {
        "reddit": {
            "no_self_promotion_in_non_promo_subs": True,
            "participation_ratio": "9:1",  # 9 helpful comments per 1 promo
            "no_dm_solicitation": True,
            "follow_subreddit_rules": True,
            "no_vote_manipulation": True,
        },
        "linkedin": {
            "no_automated_connection_requests": True,
            "personalize_all_messages": True,
            "no_mass_messaging": True,
            "respect_group_rules": True,
        },
        "twitter": {
            "no_automated_dms": True,
            "no_reply_spam": True,
            "respect_rate_limits": True,
        },
        "quora": {
            "disclose_affiliation": True,
            "provide_genuine_answers": True,
            "no_link_only_answers": True,
        },
        "facebook_groups": {
            "follow_group_guidelines": True,
            "no_promo_without_permission": True,
            "be_a_member_first": True,
        },
        "discord": {
            "follow_server_rules": True,
            "no_dm_without_permission": True,
            "no_channel_spam": True,
            "participate_before_promoting": True,
        }
    }
    
    async def validate_outreach(self, outreach: OutreachMessage, platform: str) -> bool:
        rules = self.PLATFORM_RULES.get(platform, {})
        
        for rule, required in rules.items():
            if required and not await self.check_compliance(rule, outreach):
                logger.warning(f"Outreach violates {platform} rule: {rule}")
                return False
        
        return True
```

### 7.3 Transparency Requirements

Every outreach must include:

| Element | Required | Format |
|---------|----------|--------|
| Sender's real name | Yes | "Best, John Smith" |
| Company name | Yes | "FlowStack" |
| Role at company | Yes | "Head of Growth" or "Customer Success" |
| Disclosure of affiliation | In communities | "Full transparency: I work there" |
| Easy opt-out | Yes | "Reply STOP to opt out" or "Let me know if this isn't relevant" |
| Genuine value offer | Yes | Free resource, tip, or insight before any pitch |

### 7.4 Opt-Out Handling

```python
class OptOutHandler:
    async def handle_opt_out(self, lead: Lead, message: str):
        # 1. Immediately update lead status
        lead.status = "opted_out"
        lead.tags.append("opted_out")
        
        # 2. Cancel all pending follow-ups
        await self.cancel_pending_outreach(lead.id)
        
        # 3. Remove from CRM sequences
        if lead.crm_id:
            await self.crm.remove_from_sequences(lead.crm_id)
        
        # 4. Log the opt-out
        await self.log_activity({
            "lead_id": lead.id,
            "activity_type": "opted_out",
            "details": {"opt_out_message": message}
        })
        
        # 5. Send acknowledgment (brief, respectful)
        await self.send_opt_out_confirmation(lead)
        
        # 6. Add to suppression list
        await self.suppression_list.add({
            "email": lead.email,
            "handle": lead.twitter_handle,
            "opted_out_at": datetime.utcnow(),
            "permanent": True
        })
    
    async def send_opt_out_confirmation(self, lead: Lead):
        message = (
            "No problem at all - you're opted out. "
            "You won't hear from me again. "
            "Best of luck with everything!"
        )
        await self.send_message(lead, message)
```

### 7.5 Data Privacy

- **No scraping of private profiles**: Only use publicly available data
- **No data enrichment from illegal sources**: Only use legitimate enrichment services
- **Secure storage**: All lead data encrypted at rest
- **Data minimization**: Only collect data relevant to qualification
- **Retention limits**: Delete lead data after 2 years of inactivity unless opted out
- **Right to deletion**: Honor deletion requests within 30 days

---

## 8. Anti-Spam Compliance

### 8.1 CAN-SPAM Compliance (US)

| Requirement | Implementation |
|-------------|---------------|
| Accurate header information | All emails use verified domain |
| Non-deceptive subject lines | Subject lines reflect email content |
| Clear sender identification | Real name and company in every email |
| Physical address included | Company address in email footer |
| Opt-out mechanism | Clear opt-out instructions in every email |
| Honor opt-outs within 10 days | Automated, immediate processing |
| Monitor what others do on your behalf | All outreach logged and auditable |

### 8.2 GDPR Compliance (EU)

| Requirement | Implementation |
|-------------|---------------|
| Lawful basis for processing | Legitimate interest (business development) |
| Transparency | Clear disclosure in first contact |
| Right to object | Easy opt-out in every message |
| Data minimization | Only necessary data collected |
| Storage limitation | Auto-delete after 2 years inactive |
| Records of processing | Full audit log maintained |

### 8.3 CASL Compliance (Canada)

| Requirement | Implementation |
|-------------|---------------|
| Consent | Implied consent (published business email) |
| Identification | Clear sender info in every message |
| Unsubscribe mechanism | Functioning opt-out in every message |
| Honesty | No false or misleading content |

### 8.4 Spam Score Monitoring

```python
class SpamScoreMonitor:
    async def check_email_spam_score(self, email_content: str) -> SpamReport:
        # Use SpamAssassin or similar to score
        score = await self.spam_analyzer.score(email_content)
        
        # Common triggers to avoid
        triggers = {
            "ALL_CAPS": 1.5,
            "multiple_exclamation": 1.0,
            "$$$": 2.0,
            "URGENT": 1.5,
            "LIMITED_TIME": 1.5,
            "ACT_NOW": 2.0,
            "FREE!!!": 2.5,
            "no_unsubscribe": 3.0,
            "misleading_subject": 2.5,
        }
        
        if score > 5.0:
            return SpamReport(
                score=score,
                is_acceptable=False,
                recommendations=self.generate_fixes(score, email_content)
            )
        
        return SpamReport(score=score, is_acceptable=True)
```

### 8.5 Rate Limiting

```python
OUTREACH_RATE_LIMITS = {
    # Per platform, per account, per day
    "linkedin": {
        "connection_requests": 20,
        "dms_after_connect": 50,
        "cold_dms": 10,
    },
    "twitter": {
        "dms": 50,
        "replies": 100,
    },
    "email": {
        "cold_outreach": 100,
        "follow_ups": 200,
    },
    "reddit": {
        "comments": 20,  # Must be 90% non-promotional
        "dms": 5,
    },
    "quora": {
        "answers": 10,
    }
}
```

---

*End of Lead Generation Agent Specification*
