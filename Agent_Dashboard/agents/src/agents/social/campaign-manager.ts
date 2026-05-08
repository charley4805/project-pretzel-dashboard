/**
 * Campaign Manager - Social Media Agent
 * Manages marketing campaign lifecycle, post scheduling, hashtag strategy,
 * and posting time optimization across social platforms.
 */

import {
  type Campaign,
  type CampaignConfig,
  type CampaignStatus,
  type CampaignMetrics,
  type SocialPost,
  type SocialPlatform,
 
 
  type OptimalTimeResult,
  type HashtagStrategy,
} from './types';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** Default hashtag strategy library */
const DEFAULT_HASHTAG_STRATEGY: HashtagStrategy = {
  branded: ['#FlowStack', '#FlowStackTips', '#BuiltWithFlowStack'],
  industry: ['#SaaS', '#ProductManagement', '#TeamCollaboration', '#B2B'],
  topic: ['#Productivity', '#RemoteWork', '#Agile', '#Workflow', '#Automation'],
  community: ['#TechTwitter', '#SaaSFounders', '#StartupLife', '#BuildInPublic'],
  campaign: ['#FlowStackLaunch', '#NewAtFlowStack', '#FlowStack2024'],
  trending: [],
};

/** Campaign lifecycle transitions */
const VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['active', 'cancelled'],
  active: ['paused', 'completed', 'cancelled'],
  paused: ['active', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/** Days of week mapping */
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ──────────────────────────────────────────────
// Campaign Manager Class
// ──────────────────────────────────────────────

/**
 * CampaignManager handles the full lifecycle of marketing campaigns
 * from creation through scheduling to completion and analysis.
 */
export class CampaignManager {
  private campaigns: Map<string, Campaign>;
  private posts: Map<string, SocialPost>;
  private hashtagStrategy: HashtagStrategy;

  constructor(hashtagStrategy: HashtagStrategy = DEFAULT_HASHTAG_STRATEGY) {
    this.campaigns = new Map();
    this.posts = new Map();
    this.hashtagStrategy = hashtagStrategy;
    this.initializeMockCampaigns();
  }

  // ── Campaign Lifecycle ──

  /**
   * Create a new marketing campaign from configuration.
   * @param config - Campaign creation parameters
   * @returns The created Campaign
   */
  createCampaign(config: CampaignConfig): Campaign {
    const now = new Date().toISOString();
    const id = this.generateId('campaign');

    const campaign: Campaign = {
      id,
      name: config.name,
      description: config.description,
      objective: config.objective,
      status: 'draft',
      platforms: config.platforms,
      startDate: config.startDate,
      endDate: config.endDate,
      posts: [],
      targetMetrics: config.targetMetrics,
      tags: config.tags ?? [],
      utmCampaign: config.utmCampaign,
      budget: config.budget,
      createdAt: now,
      updatedAt: now,
    };

    this.campaigns.set(id, campaign);
    return campaign;
  }

  /**
   * Transition a campaign to a new status.
   * @param campaignId - The campaign to update
   * @param newStatus - Target status
   * @returns Updated campaign or throws on invalid transition
   */
  transitionStatus(campaignId: string, newStatus: CampaignStatus): Campaign {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const validTransitions = VALID_TRANSITIONS[campaign.status];
    if (!validTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid transition from ${campaign.status} to ${newStatus}. Valid: ${validTransitions.join(', ')}`
      );
    }

    const updated: Campaign = {
      ...campaign,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.set(campaignId, updated);
    return updated;
  }

  /**
   * Activate a campaign (draft -> active).
   * @param campaignId - The campaign to activate
   */
  activateCampaign(campaignId: string): Campaign {
    return this.transitionStatus(campaignId, 'active');
  }

  /**
   * Pause an active campaign.
   * @param campaignId - The campaign to pause
   */
  pauseCampaign(campaignId: string): Campaign {
    return this.transitionStatus(campaignId, 'paused');
  }

  /**
   * Complete a campaign.
   * @param campaignId - The campaign to complete
   */
  completeCampaign(campaignId: string): Campaign {
    return this.transitionStatus(campaignId, 'completed');
  }

  // ── Post Scheduling ──

  /**
   * Schedule a collection of posts for a campaign.
   * @param campaign - The target campaign
   * @param posts - Posts to schedule (will update with times)
   * @returns Array of scheduled posts
   */
  schedulePosts(campaign: Campaign, posts: SocialPost[]): SocialPost[] {
    const scheduled: SocialPost[] = [];
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const durationMs = endDate.getTime() - startDate.getTime();

    // Distribute posts evenly across campaign duration
    const intervalMs = durationMs / Math.max(posts.length, 1);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const idealTime = new Date(startDate.getTime() + intervalMs * i);

      // Get optimal posting time for the platform
      const optimal = this.getOptimalPostingTime(post.platform);

      // Combine date from distribution with optimal time
      const [hour, minute] = optimal.suggestedTimeUtc.split(':').map(Number);
      const scheduledTime = new Date(idealTime);
      scheduledTime.setUTCHours(hour, minute, 0, 0);

      // Ensure we don't go past end date
      if (scheduledTime > endDate) {
        scheduledTime.setTime(endDate.getTime() - 3600000);
      }

      const updatedPost: SocialPost = {
        ...post,
        campaignId: campaign.id,
        scheduledTime: scheduledTime.toISOString(),
        status: 'scheduled',
        updatedAt: new Date().toISOString(),
      };

      this.posts.set(updatedPost.id, updatedPost);
      scheduled.push(updatedPost);

      // Update campaign post list
      if (!campaign.posts.includes(updatedPost.id)) {
        campaign.posts.push(updatedPost.id);
      }
    }

    // Save campaign update
    this.campaigns.set(campaign.id, { ...campaign, updatedAt: new Date().toISOString() });

    return scheduled;
  }

  /**
   * Publish a post immediately.
   * @param post - The post to publish
   * @returns Published post with updated status
   */
  publishPost(post: SocialPost): SocialPost {
    const published: SocialPost = {
      ...post,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.posts.set(published.id, published);
    return published;
  }

  /**
   * Get the optimal posting time for a platform.
   * @param platform - Target platform
   * @param timezone - Optional timezone for localization
   * @returns Optimal posting time recommendation
   */
  getOptimalPostingTime(platform: SocialPlatform, timezone?: string): OptimalTimeResult {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();

    // Platform-specific optimal times
    const platformTimes: Record<SocialPlatform, { bestDays: number[]; times: string[] }> = {
      twitter: { bestDays: [2, 3, 4], times: ['12:00', '17:00'] },
      linkedin: { bestDays: [2, 3, 4], times: ['08:00', '12:00'] },
      facebook: { bestDays: [3, 4, 5], times: ['13:00', '15:00'] },
      instagram: { bestDays: [1, 2, 3, 4, 5], times: ['11:00', '14:00'] },
    };

    const config = platformTimes[platform];

    // Find next optimal time
    let targetDay = dayOfWeek;
    let daysUntilBest = 0;

    // Check if today is a good day
    if (!config.bestDays.includes(dayOfWeek)) {
      // Find next best day
      for (let i = 1; i <= 7; i++) {
        const checkDay = (dayOfWeek + i) % 7;
        if (checkDay === 0) continue; // Skip Sunday
        if (config.bestDays.includes(checkDay)) {
          daysUntilBest = i;
          targetDay = checkDay;
          break;
        }
      }
    }

    // Pick the best time slot
    const currentHour = now.getUTCHours();
    let bestTime = config.times[0];

    // If today is a good day, pick the next available time slot
    if (daysUntilBest === 0) {
      for (const time of config.times) {
        const [h] = time.split(':').map(Number);
        if (h > currentHour) {
          bestTime = time;
          break;
        }
      }
    }

    const suggestedTime = new Date(now);
    suggestedTime.setUTCDate(suggestedTime.getUTCDate() + daysUntilBest);
    const [hour, minute] = bestTime.split(':').map(Number);
    suggestedTime.setUTCHours(hour, minute, 0, 0);

    const reason = `${DAYS_OF_WEEK[targetDay]} at ${bestTime} UTC is optimal for ${platform} (peak engagement period)`;

    return {
      platform,
      suggestedTimeUtc: suggestedTime.toISOString(),
      suggestedTimeLocal: timezone ? this.convertTimezone(suggestedTime, timezone) : undefined,
      confidence: 85,
      reason,
    };
  }

  // ── Metrics ──

  /**
   * Get campaign performance metrics.
   * @param campaignId - The campaign to analyze
   * @returns Aggregated campaign metrics
   */
  getCampaignMetrics(campaignId: string): CampaignMetrics | undefined {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return undefined;

    if (campaign.actualMetrics) {
      return campaign.actualMetrics;
    }

    // Compute metrics from posts
    const campaignPosts = campaign.posts
      .map((postId) => this.posts.get(postId))
      .filter((p): p is SocialPost => p !== undefined);

    const totalReach = campaignPosts.reduce((sum, p) => sum + (p.metrics?.reach ?? 0), 0);
    const totalImpressions = campaignPosts.reduce((sum, p) => sum + (p.metrics?.impressions ?? 0), 0);
    const totalEngagements = campaignPosts.reduce(
      (sum, p) => sum + (p.metrics?.likes ?? 0) + (p.metrics?.comments ?? 0) + (p.metrics?.shares ?? 0),
      0
    );
    const totalClicks = campaignPosts.reduce((sum, p) => sum + (p.metrics?.clicks ?? 0), 0);

    const engagementRate = totalReach > 0 ? (totalEngagements / totalReach) * 100 : 0;
    const clickThroughRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalReach,
      totalImpressions,
      totalEngagements,
      totalClicks,
      totalConversions: 0,
      engagementRate: Math.round(engagementRate * 100) / 100,
      clickThroughRate: Math.round(clickThroughRate * 100) / 100,
      followerGrowth: 0,
      sentimentScore: 0.75,
    };
  }

  /**
   * Update campaign with actual performance metrics.
   * @param campaignId - Campaign to update
   * @param metrics - Measured metrics
   */
  updateCampaignMetrics(campaignId: string, metrics: CampaignMetrics): Campaign {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign not found: ${campaignId}`);
    }

    const updated: Campaign = {
      ...campaign,
      actualMetrics: metrics,
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.set(campaignId, updated);
    return updated;
  }

  // ── Hashtag Strategy ──

  /**
   * Select optimal hashtags for a post based on platform and content.
   * @param platform - Target platform
   * @param contentType - Type of content
   * @param topic - Content topic
   * @returns Array of recommended hashtags
   */
  selectHashtags(platform: SocialPlatform, _contentType: string, topic: string): string[] {
    const platformLimits: Record<SocialPlatform, number> = {
      twitter: 2,
      linkedin: 5,
      instagram: 10,
      facebook: 2,
    };

    const limit = platformLimits[platform];
    const hashtags: string[] = [];

    // Mix strategy: 1 branded + 1-2 industry + 1-2 topic + 0-1 campaign
    if (this.hashtagStrategy.branded.length > 0) {
      hashtags.push(this.hashtagStrategy.branded[0]);
    }

    if (this.hashtagStrategy.industry.length > 0) {
      hashtags.push(...this.hashtagStrategy.industry.slice(0, 2));
    }

    // Match topic hashtags to content
    const topicMatches = this.hashtagStrategy.topic.filter(
      (t) => topic.toLowerCase().includes(t.replace('#', '').toLowerCase())
    );
    if (topicMatches.length > 0) {
      hashtags.push(topicMatches[0]);
    } else if (this.hashtagStrategy.topic.length > 0) {
      hashtags.push(this.hashtagStrategy.topic[0]);
    }

    // Add campaign hashtag if available
    if (this.hashtagStrategy.campaign.length > 0) {
      hashtags.push(this.hashtagStrategy.campaign[0]);
    }

    // Limit to platform max
    const result = hashtags.slice(0, limit);

    // Ensure trending hashtags are only used if genuinely relevant
    if (this.hashtagStrategy.trending.length > 0) {
      const relevantTrending = this.hashtagStrategy.trending.filter((t) =>
        topic.toLowerCase().includes(t.replace('#', '').toLowerCase())
      );
      if (relevantTrending.length > 0 && result.length < limit) {
        result.push(relevantTrending[0]);
      }
    }

    return result.slice(0, limit);
  }

  /**
   * Get the full hashtag strategy.
   * @returns Current hashtag strategy configuration
   */
  getHashtagStrategy(): HashtagStrategy {
    return { ...this.hashtagStrategy };
  }

  /**
   * Update the hashtag strategy.
   * @param strategy - New hashtag strategy
   */
  updateHashtagStrategy(strategy: HashtagStrategy): void {
    this.hashtagStrategy = strategy;
  }

  // ── Query Methods ──

  /** Get a campaign by ID */
  getCampaign(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  /** Get all campaigns, optionally filtered by status */
  getAllCampaigns(status?: CampaignStatus): Campaign[] {
    const all = Array.from(this.campaigns.values());
    if (status) {
      return all.filter((c) => c.status === status);
    }
    return all;
  }

  /** Get posts for a campaign */
  getCampaignPosts(campaignId: string): SocialPost[] {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return [];
    return campaign.posts
      .map((postId) => this.posts.get(postId))
      .filter((p): p is SocialPost => p !== undefined);
  }

  /** Get a post by ID */
  getPost(id: string): SocialPost | undefined {
    return this.posts.get(id);
  }

  /** Get all posts */
  getAllPosts(): SocialPost[] {
    return Array.from(this.posts.values());
  }

  /** Get campaign statistics summary */
  getStats(): {
    totalCampaigns: number;
    byStatus: Record<CampaignStatus, number>;
    totalPosts: number;
    totalScheduled: number;
    totalPublished: number;
  } {
    const campaigns = this.getAllCampaigns();
    const posts = this.getAllPosts();

    const byStatus: Record<CampaignStatus, number> = {
      draft: 0,
      active: 0,
      paused: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const c of campaigns) {
      byStatus[c.status]++;
    }

    return {
      totalCampaigns: campaigns.length,
      byStatus,
      totalPosts: posts.length,
      totalScheduled: posts.filter((p) => p.status === 'scheduled').length,
      totalPublished: posts.filter((p) => p.status === 'published').length,
    };
  }

  // ── Private Helpers ──

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private convertTimezone(date: Date, timezone: string): string {
    // Simple timezone conversion for common zones
    const offsets: Record<string, number> = {
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Europe/Berlin': 1,
      'Asia/Tokyo': 9,
      'Asia/Singapore': 8,
      'Australia/Sydney': 11,
    };

    const offset = offsets[timezone] ?? 0;
    const local = new Date(date.getTime() + offset * 3600000);
    return local.toISOString();
  }

  /** Initialize with realistic mock campaigns */
  private initializeMockCampaigns(): void {
    const now = new Date();

    // Campaign 1: Product Launch (Q1)
    const launchCampaign: Campaign = {
      id: 'campaign_001',
      name: 'Q1 Smart Reports Launch',
      description: 'Multi-platform campaign announcing the new Smart Reports feature with tutorials and social proof.',
      objective: 'conversion',
      status: 'active',
      platforms: ['twitter', 'linkedin', 'facebook', 'instagram'],
      startDate: new Date(now.getTime() - 7 * 86400000).toISOString(),
      endDate: new Date(now.getTime() + 21 * 86400000).toISOString(),
      posts: [],
      targetMetrics: {
        targetReach: 50000,
        targetEngagementRate: 4.0,
        targetClicks: 2500,
        targetConversions: 200,
        targetFollowerGrowth: 1000,
      },
      tags: ['product-launch', 'smart-reports', 'q1-2024'],
      utmCampaign: 'q1_smart_reports_launch',
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updatedAt: now.toISOString(),
    };

    // Campaign 2: Brand Awareness
    const awarenessCampaign: Campaign = {
      id: 'campaign_002',
      name: 'Brand Awareness - Productivity Month',
      description: 'Thought leadership and educational content to build brand authority in the productivity space.',
      objective: 'awareness',
      status: 'active',
      platforms: ['twitter', 'linkedin'],
      startDate: now.toISOString(),
      endDate: new Date(now.getTime() + 30 * 86400000).toISOString(),
      posts: [],
      targetMetrics: {
        targetReach: 100000,
        targetEngagementRate: 3.0,
        targetClicks: 1500,
        targetConversions: 100,
        targetFollowerGrowth: 2500,
      },
      tags: ['awareness', 'productivity', 'thought-leadership'],
      utmCampaign: 'productivity_month_awareness',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Campaign 3: Event Promotion
    const eventCampaign: Campaign = {
      id: 'campaign_003',
      name: 'Webinar: Scaling Your SaaS Stack',
      description: 'Drive registrations for the upcoming webinar on SaaS tool optimization.',
      objective: 'event',
      status: 'draft',
      platforms: ['twitter', 'linkedin', 'facebook'],
      startDate: new Date(now.getTime() + 7 * 86400000).toISOString(),
      endDate: new Date(now.getTime() + 21 * 86400000).toISOString(),
      posts: [],
      targetMetrics: {
        targetReach: 25000,
        targetEngagementRate: 5.0,
        targetClicks: 1200,
        targetConversions: 300,
        targetFollowerGrowth: 500,
      },
      tags: ['webinar', 'saas-scaling', 'education'],
      utmCampaign: 'webinar_saas_stack_scaling',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Campaign 4: Seasonal
    const seasonalCampaign: Campaign = {
      id: 'campaign_004',
      name: 'Year-End Review Campaign',
      description: 'Celebrate customer wins and share year-in-review content.',
      objective: 'engagement',
      status: 'completed',
      platforms: ['twitter', 'linkedin', 'instagram'],
      startDate: new Date(now.getTime() - 60 * 86400000).toISOString(),
      endDate: new Date(now.getTime() - 30 * 86400000).toISOString(),
      posts: [],
      targetMetrics: {
        targetReach: 75000,
        targetEngagementRate: 3.5,
        targetClicks: 1000,
        targetConversions: 150,
        targetFollowerGrowth: 2000,
      },
      actualMetrics: {
        totalReach: 82000,
        totalImpressions: 185000,
        totalEngagements: 3400,
        totalClicks: 1350,
        totalConversions: 189,
        engagementRate: 4.1,
        clickThroughRate: 0.73,
        followerGrowth: 2350,
        sentimentScore: 0.82,
      },
      tags: ['year-end', 'review', 'celebration'],
      utmCampaign: 'year_end_review_2024',
      createdAt: new Date(now.getTime() - 90 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    };

    this.campaigns.set(launchCampaign.id, launchCampaign);
    this.campaigns.set(awarenessCampaign.id, awarenessCampaign);
    this.campaigns.set(eventCampaign.id, eventCampaign);
    this.campaigns.set(seasonalCampaign.id, seasonalCampaign);
  }
}

// ──────────────────────────────────────────────
// Mock Data Exports
// ──────────────────────────────────────────────

/** Generate realistic mock social posts for testing */
export function generateMockPosts(): SocialPost[] {
  const now = new Date();
  const baseTime = now.getTime();

  const posts: SocialPost[] = [
    {
      id: 'post_001',
      content: '3 things that made our standups go from 30 minutes to 10:\n\n1. No laptops/phones\n2. Only 3 questions\n3. Blockers addressed after\n\nThe goal isn\'t to solve problems in the standup. It\'s to identify them fast.\n\nWhat rule does your team swear by?',
      platform: 'twitter',
      type: 'educational',
      subType: 'tip',
      status: 'published',
      campaignId: 'campaign_002',
      hashtags: ['#Productivity'],
      platformPostId: 'tw_1892347123',
      authorId: 'social-agent',
      metrics: {
        reach: 12500,
        impressions: 28700,
        likes: 342,
        comments: 56,
        shares: 89,
        clicks: 234,
        engagementRate: 3.9,
        clickThroughRate: 0.82,
        sentimentScore: 0.78,
      },
      createdAt: new Date(baseTime - 2 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 2 * 86400000).toISOString(),
    },
    {
      id: 'post_002',
      content: 'Introducing Smart Reports - save hours every week.\n\nWhat used to take hours now takes seconds. Built for teams that value their time.\n\nTry it: https://flowstack.io/feature?utm_source=social&utm_campaign=q1_smart_reports_launch',
      platform: 'twitter',
      type: 'promotional',
      subType: 'feature_announcement',
      status: 'published',
      campaignId: 'campaign_001',
      hashtags: ['#ProductUpdate'],
      platformPostId: 'tw_1892400567',
      authorId: 'social-agent',
      metrics: {
        reach: 18900,
        impressions: 42300,
        likes: 456,
        comments: 78,
        shares: 134,
        clicks: 567,
        engagementRate: 4.1,
        clickThroughRate: 1.34,
        sentimentScore: 0.85,
      },
      createdAt: new Date(baseTime - 1 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 1 * 86400000).toISOString(),
    },
    {
      id: 'post_003',
      content: 'Today we\'re introducing Smart Reports - a capability our enterprise customers have been requesting for months.\n\nKey benefits:\n- Reduces manual reporting by 70%\n- Integrates with your existing BI stack\n- Maintains enterprise-grade security\n\nThis aligns with our commitment to making data-driven decision-making accessible to teams of all sizes.\n\nFull details: https://flowstack.io/feature\n\n#SaaS #ProductManagement',
      platform: 'linkedin',
      type: 'promotional',
      subType: 'feature_announcement',
      status: 'published',
      campaignId: 'campaign_001',
      hashtags: ['#SaaS', '#ProductManagement'],
      platformPostId: 'li_7293846510',
      authorId: 'social-agent',
      metrics: {
        reach: 34200,
        impressions: 78600,
        likes: 892,
        comments: 156,
        shares: 234,
        clicks: 890,
        engagementRate: 3.8,
        clickThroughRate: 1.13,
        sentimentScore: 0.81,
      },
      createdAt: new Date(baseTime - 1 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 1 * 86400000).toISOString(),
    },
    {
      id: 'post_004',
      content: "What's your biggest productivity killer?\n\n1. Notifications\n2. Meetings\n3. Context switching\n4. Email\n\nVote below - I'll share the results + solutions tomorrow.",
      platform: 'twitter',
      type: 'engagement',
      subType: 'poll',
      status: 'published',
      hashtags: ['#Poll'],
      platformPostId: 'tw_1892500123',
      authorId: 'social-agent',
      metrics: {
        reach: 22100,
        impressions: 45600,
        likes: 567,
        comments: 890,
        shares: 234,
        clicks: 0,
        engagementRate: 7.6,
        clickThroughRate: 0,
        sentimentScore: 0.72,
      },
      createdAt: new Date(baseTime - 3 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 3 * 86400000).toISOString(),
    },
    {
      id: 'post_005',
      content: '✨ Stop manually copying data into spreadsheets.\n\nHere\'s how to automate your weekly report in 5 minutes:\n\nStep 1: Connect your data source\nStep 2: Choose your metrics\nStep 3: Set the schedule\nStep 4: Add recipients\nStep 5: Hit publish\n\nYour future self will thank you.\n\n[Link to detailed guide]',
      platform: 'instagram',
      type: 'educational',
      subType: 'how_to',
      status: 'published',
      campaignId: 'campaign_002',
      hashtags: ['#Productivity', '#SaaS', '#Automation'],
      platformPostId: 'ig_3384729104',
      authorId: 'social-agent',
      metrics: {
        reach: 18400,
        impressions: 42300,
        likes: 723,
        comments: 45,
        shares: 89,
        clicks: 345,
        saves: 567,
        engagementRate: 4.8,
        clickThroughRate: 0.82,
        sentimentScore: 0.88,
      },
      createdAt: new Date(baseTime - 4 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 4 * 86400000).toISOString(),
    },
    {
      id: 'post_006',
      content: '"Remote teams are LESS productive."\n\nWe\'ve heard this for 5 years.\n\nBut our data from 10,000+ teams shows the opposite:\n\n- Deep work hours: +40%\n- Meeting time: -25%\n- Employee satisfaction: +35%\n\nThe problem isn\'t remote work.\nIt\'s poor async communication habits.\n\nWhat\'s your #1 remote work tip?',
      platform: 'linkedin',
      type: 'educational',
      subType: 'myth_busting',
      status: 'published',
      campaignId: 'campaign_002',
      hashtags: ['#RemoteWork', '#SaaS'],
      platformPostId: 'li_7294012389',
      authorId: 'social-agent',
      metrics: {
        reach: 56700,
        impressions: 134000,
        likes: 1234,
        comments: 456,
        shares: 567,
        clicks: 890,
        engagementRate: 5.1,
        clickThroughRate: 0.66,
        sentimentScore: 0.76,
      },
      createdAt: new Date(baseTime - 5 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 5 * 86400000).toISOString(),
    },
    {
      id: 'post_007',
      content: 'Building Smart Reports behind the scenes:\n\n3 months of iteration, 12 prototypes, and one breakthrough moment when everything clicked.\n\nSwipe to see the process 📊\n\nWhat features would you like to see next?',
      platform: 'instagram',
      type: 'engagement',
      subType: 'behind_scenes',
      status: 'published',
      campaignId: 'campaign_001',
      hashtags: ['#BehindTheScenes', '#StartupLife'],
      platformPostId: 'ig_3384901234',
      authorId: 'social-agent',
      metrics: {
        reach: 12300,
        impressions: 28900,
        likes: 890,
        comments: 123,
        shares: 45,
        clicks: 234,
        saves: 156,
        engagementRate: 8.2,
        clickThroughRate: 0.81,
        sentimentScore: 0.91,
      },
      createdAt: new Date(baseTime - 6 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 6 * 86400000).toISOString(),
    },
    {
      id: 'post_008',
      content: 'The one tool I can\'t live without is ___________.\n\nI\'ll start: FlowStack because it automates my weekly reports.\n\nYour turn. Drop yours below.',
      platform: 'facebook',
      type: 'engagement',
      subType: 'fill_in_blank',
      status: 'published',
      hashtags: ['#Tools'],
      platformPostId: 'fb_4829105673',
      authorId: 'social-agent',
      metrics: {
        reach: 8900,
        impressions: 15600,
        likes: 234,
        comments: 567,
        shares: 89,
        clicks: 0,
        engagementRate: 10.0,
        clickThroughRate: 0,
        sentimentScore: 0.85,
      },
      createdAt: new Date(baseTime - 7 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 7 * 86400000).toISOString(),
    },
    {
      id: 'post_009',
      content: 'We analyzed 50,000 projects. Here\'s what we found:\n\n68% of projects fail because of ONE thing:\n\nNot bad planning.\nNot bad execution.\n\nBad communication.\n\nTeams that check in daily are 3x more likely to deliver on time.\n\nThe fix is simpler than you think.\n\n[Link to full report]',
      platform: 'twitter',
      type: 'educational',
      subType: 'data_insight',
      status: 'scheduled',
      campaignId: 'campaign_002',
      hashtags: ['#DataInsights', '#SaaS'],
      scheduledTime: new Date(baseTime + 86400000).toISOString(),
      authorId: 'social-agent',
      createdAt: new Date(baseTime - 1 * 86400000).toISOString(),
      updatedAt: new Date(baseTime - 1 * 86400000).toISOString(),
    },
    {
      id: 'post_010',
      content: 'Acme Corp was spending 20 hours/week on manual reporting.\n\nIn 30 days using FlowStack, they:\n- Cut reporting time by 70%\n- Reduced errors by 85%\n- Freed up 2 team members\n\nHere\'s exactly how: [link]\n\nWhat metric would move the needle for your team?',
      platform: 'linkedin',
      type: 'promotional',
      subType: 'case_study',
      status: 'draft',
      campaignId: 'campaign_001',
      hashtags: ['#CaseStudy', '#SaaS'],
      authorId: 'social-agent',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  return posts;
}
