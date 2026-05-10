/**
 * Social Media Agent - Main Orchestrator
 * Coordinates content creation, engagement management, and campaign execution
 * across Twitter/X, LinkedIn, Facebook, and Instagram.
 *
 * @example
 * ```typescript
 * import { SocialMediaAgent } from './agents/social';
 *
 * const agent = new SocialMediaAgent({
 *   brandName: 'FlowStack',
 *   agentName: 'Social Lead',
 *   industry: 'SaaS project management',
 *   targetAudience: 'startup founders, product managers',
 * });
 *
 * // Create a post
 * const post = agent.createContent({
 *   type: 'educational',
 *   subType: 'tip',
 *   topic: 'improving team standups',
 *   platform: 'twitter',
 * });
 *
 * // Process an incoming engagement
 * const result = agent.processEngagement(interaction);
 *
 * // Create and manage a campaign
 * const campaign = agent.createCampaign({
 *   name: 'Product Launch',
 *   objective: 'conversion',
 *   platforms: ['twitter', 'linkedin'],
 *   startDate: '2025-02-01',
 *   endDate: '2025-02-28',
 *   utmCampaign: 'feb_launch',
 *   targetMetrics: { targetReach: 50000, targetEngagementRate: 4, targetClicks: 2000, targetConversions: 150, targetFollowerGrowth: 1000 },
 * });
 * ```
 */

import { ContentEngine } from './content-engine';
import { EngagementManager, generateMockInteractions } from './engagement-manager';
import { CampaignManager, generateMockPosts } from './campaign-manager';
import {
  type SocialPlatform,
  type ContentType,
  type EducationalSubType,
  type PromotionalSubType,
  type EngagementSubType,
  type SocialPost,
  type Campaign,
  type CampaignConfig,
  type CampaignStatus,
  type CampaignMetrics,
  type EngagementInteraction,
  type InteractionType,
  type ActionType,
  type ContentRequest,
  type ScheduleConfig,
  type ScreeningResult,
  type ContentTemplate,
  type PlatformConfig,
  type AnalyticsSummary,
  type HashtagStrategy,
  type VoiceProfile,
  type MockDataSet,
  type PostMetrics,
} from './types';

// ──────────────────────────────────────────────
// Re-exports for consumers
// ──────────────────────────────────────────────

export {
  ContentEngine,
  EngagementManager,
  CampaignManager,
  generateMockInteractions,
  generateMockPosts,
};

export type {
  SocialPlatform,
  ContentType,
  EducationalSubType,
  PromotionalSubType,
  EngagementSubType,
  SocialPost,
  Campaign,
  CampaignConfig,
  CampaignStatus,
  CampaignMetrics,
  EngagementInteraction,
  InteractionType,
  ActionType,
  ContentRequest,
  ScheduleConfig,
  ScreeningResult,
  ContentTemplate,
  PlatformConfig,
  AnalyticsSummary,
  HashtagStrategy,
  VoiceProfile,
  MockDataSet,
  PostMetrics,
};

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

/** Agent configuration options */
export interface SocialAgentConfig {
  /** Agent display name */
  agentName: string;
  /** Brand/company name */
  brandName: string;
  /** Industry vertical */
  industry: string;
  /** Primary target audience */
  targetAudience: string;
  /** Brand voice description text */
  brandVoiceDescription?: string;
  /** Active campaigns context for prompts */
  activeCampaigns?: string;
  /** Upcoming content calendar */
  contentCalendarUpcoming?: string;
  /** Custom hashtag strategy */
  hashtagStrategy?: HashtagStrategy;
  /** Whether to require human approval for all posts */
  requireApproval?: boolean;
  /** Auto-publish approved posts */
  autoPublish?: boolean;
  /** Platforms this agent manages */
  managedPlatforms?: SocialPlatform[];
}

/** Default configuration values */
const DEFAULT_CONFIG: Partial<SocialAgentConfig> = {
  brandVoiceDescription:
    'Professional but approachable. Knowledgeable without being arrogant. Direct but not blunt. We sound like a smart colleague giving advice over coffee.',
  activeCampaigns: 'No active campaigns.',
  contentCalendarUpcoming: 'No upcoming events scheduled.',
  requireApproval: false,
  autoPublish: false,
  managedPlatforms: ['twitter', 'linkedin', 'facebook', 'instagram'],
};

// ──────────────────────────────────────────────
// Social Media Agent Class
// ──────────────────────────────────────────────

/**
 * SocialMediaAgent is the main orchestrator that coordinates all
 * social media activities: content creation, engagement handling,
 * campaign management, and analytics.
 */
export class SocialMediaAgent {
  private config: Required<SocialAgentConfig>;
  private contentEngine: ContentEngine;
  private engagementManager: EngagementManager;
  private campaignManager: CampaignManager;

  /**
   * Create a new SocialMediaAgent instance.
   * @param config - Agent configuration
   */
  constructor(config: SocialAgentConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<SocialAgentConfig>;
    this.contentEngine = new ContentEngine(config.hashtagStrategy);
    this.engagementManager = new EngagementManager();
    this.campaignManager = new CampaignManager(config.hashtagStrategy);
  }

  // ── Content Creation ──

  /**
   * Create a new social media post.
   * @param request - Content creation parameters
   * @returns Generated post
   */
  createContent(request: ContentRequest): SocialPost {
    return this.contentEngine.createPost(request);
  }

  /**
   * Create an educational post.
   * @param topic - Subject matter
   * @param platform - Target platform
   * @param subType - Educational format (default: 'tip')
   * @param campaignId - Optional campaign association
   * @returns Generated educational post
   */
  createEducationalPost(
    topic: string,
    platform: SocialPlatform,
    subType: EducationalSubType = 'tip',
    campaignId?: string
  ): SocialPost {
    return this.contentEngine.generateEducationalPost(topic, platform, subType, campaignId);
  }

  /**
   * Create a promotional post.
   * @param feature - Feature or promotional topic
   * @param platform - Target platform
   * @param subType - Promotional format (default: 'feature_announcement')
   * @param campaignId - Optional campaign association
   * @returns Generated promotional post
   */
  createPromotionalPost(
    feature: string,
    platform: SocialPlatform,
    subType: PromotionalSubType = 'feature_announcement',
    campaignId?: string
  ): SocialPost {
    return this.contentEngine.generatePromotionalPost(feature, platform, subType, campaignId);
  }

  /**
   * Create an engagement post (polls, questions, etc.).
   * @param type - Engagement format
   * @param platform - Target platform
   * @param campaignId - Optional campaign association
   * @returns Generated engagement post
   */
  createEngagementPost(
    type: EngagementSubType = 'question',
    platform: SocialPlatform,
    campaignId?: string
  ): SocialPost {
    return this.contentEngine.generateEngagementPost(type, platform, campaignId);
  }

  /**
   * Screen content for compliance before publishing.
   * @param content - Content to screen
   * @returns Screening result with issues and approval status
   */
  screenContent(content: string): ScreeningResult {
    return this.contentEngine.screenContent(content);
  }

  /**
   * Adapt content for a specific platform.
   * @param content - Raw content
   * @param platform - Target platform
   * @returns Platform-adapted content
   */
  adaptForPlatform(content: string, platform: SocialPlatform): string {
    return this.contentEngine.adaptForPlatform(content, platform);
  }

  // ── Engagement ──

  /**
   * Process an incoming engagement interaction.
   * @param interaction - The engagement to process
   * @returns Processed interaction with action and reply
   */
  processEngagement(interaction: EngagementInteraction): EngagementInteraction {
    return this.engagementManager.processInteraction(interaction);
  }

  /**
   * Decide the appropriate action for an interaction.
   * @param interaction - The engagement to evaluate
   * @returns Recommended action type
   */
  decideEngagementAction(interaction: EngagementInteraction): ActionType {
    return this.engagementManager.decideResponseAction(interaction);
  }

  /**
   * Generate a reply for an interaction.
   * @param interaction - The engagement to reply to
   * @returns Generated reply content
   */
  generateReply(interaction: EngagementInteraction): string {
    return this.engagementManager.generateReply(interaction);
  }

  /**
   * Evaluate whether to like an interaction.
   * @param interaction - The engagement to evaluate
   * @returns True if should like
   */
  shouldLike(interaction: EngagementInteraction): boolean {
    return this.engagementManager.shouldLike(interaction);
  }

  /**
   * Evaluate whether to share an interaction.
   * @param interaction - The engagement to evaluate
   * @returns True if should share
   */
  shouldShare(interaction: EngagementInteraction): boolean {
    return this.engagementManager.shouldShare(interaction);
  }

  // ── Campaigns ──

  /**
   * Create a new marketing campaign.
   * @param config - Campaign configuration
   * @returns Created campaign
   */
  createCampaign(config: CampaignConfig): Campaign {
    return this.campaignManager.createCampaign(config);
  }

  /**
   * Schedule posts for a campaign.
   * @param campaign - The target campaign
   * @param posts - Posts to schedule
   * @returns Scheduled posts
   */
  scheduleCampaignPosts(campaign: Campaign, posts: SocialPost[]): SocialPost[] {
    return this.campaignManager.schedulePosts(campaign, posts);
  }

  /**
   * Get campaign metrics.
   * @param campaignId - Campaign to analyze
   * @returns Aggregated metrics or undefined
   */
  getCampaignMetrics(campaignId: string): CampaignMetrics | undefined {
    return this.campaignManager.getCampaignMetrics(campaignId);
  }

  /**
   * Publish a post immediately.
   * @param post - Post to publish
   * @returns Published post
   */
  publishPost(post: SocialPost): SocialPost {
    return this.campaignManager.publishPost(post);
  }

  /**
   * Get optimal posting time for a platform.
   * @param platform - Target platform
   * @param timezone - Optional timezone
   * @returns Optimal time recommendation
   */
  getOptimalPostingTime(platform: SocialPlatform, timezone?: string): { suggestedTimeUtc: string; confidence: number; reason: string } {
    const result = this.campaignManager.getOptimalPostingTime(platform, timezone);
    return {
      suggestedTimeUtc: result.suggestedTimeUtc,
      confidence: result.confidence,
      reason: result.reason,
    };
  }

  /**
   * Transition a campaign status.
   * @param campaignId - Campaign to update
   * @param newStatus - Target status
   */
  transitionCampaignStatus(campaignId: string, newStatus: CampaignStatus): Campaign {
    return this.campaignManager.transitionStatus(campaignId, newStatus);
  }

  // ── Analytics ──

  /**
   * Get agent analytics summary.
   * @param startDate - Period start (ISO-8601)
   * @param endDate - Period end (ISO-8601)
   * @returns Analytics summary
   */
  getAnalytics(startDate: string, endDate: string): AnalyticsSummary {
    const posts = this.contentEngine.getAllPosts();
    // const engagements = this.engagementManager.getAllInteractions(true);
    // const campaigns = this.campaignManager.getAllCampaigns();

    const platformBreakdown: AnalyticsSummary['platformBreakdown'] = {
      twitter: { postsPublished: 0, reach: 0, impressions: 0, engagements: 0, engagementRate: 0, clicks: 0, clickThroughRate: 0, followerGrowth: 0, bestPerformingContentType: 'educational' },
      linkedin: { postsPublished: 0, reach: 0, impressions: 0, engagements: 0, engagementRate: 0, clicks: 0, clickThroughRate: 0, followerGrowth: 0, bestPerformingContentType: 'educational' },
      facebook: { postsPublished: 0, reach: 0, impressions: 0, engagements: 0, engagementRate: 0, clicks: 0, clickThroughRate: 0, followerGrowth: 0, bestPerformingContentType: 'educational' },
      instagram: { postsPublished: 0, reach: 0, impressions: 0, engagements: 0, engagementRate: 0, clicks: 0, clickThroughRate: 0, followerGrowth: 0, bestPerformingContentType: 'educational' },
    };

    // Aggregate platform stats from published posts
    for (const post of posts) {
      if (post.status === 'published' && post.metrics) {
        const p = platformBreakdown[post.platform];
        p.postsPublished++;
        p.reach += post.metrics.reach;
        p.impressions += post.metrics.impressions;
        p.engagements += post.metrics.likes + post.metrics.comments + post.metrics.shares;
        p.clicks += post.metrics.clicks;
      }
    }

    // Calculate rates
    for (const platform of Object.keys(platformBreakdown) as SocialPlatform[]) {
      const p = platformBreakdown[platform];
      p.engagementRate = p.reach > 0 ? Math.round((p.engagements / p.reach) * 10000) / 100 : 0;
      p.clickThroughRate = p.impressions > 0 ? Math.round((p.clicks / p.impressions) * 10000) / 100 : 0;
    }

    const totalEngagements = Object.values(platformBreakdown).reduce((s, p) => s + p.engagements, 0);
    const totalReach = Object.values(platformBreakdown).reduce((s, p) => s + p.reach, 0);

    // Get top performing posts by engagement rate
    const topPosts = posts
      .filter((p) => p.metrics)
      .sort((a, b) => (b.metrics!.engagementRate - a.metrics!.engagementRate))
      .slice(0, 5)
      .map((p) => p.id);

    return {
      period: { start: startDate, end: endDate },
      platformBreakdown,
      topPerformingPosts: topPosts,
      totalEngagements,
      totalReach,
      followerGrowth: 0,
      avgResponseTimeMinutes: this.engagementManager.getAverageResponseTime(),
      sentimentScore: 0.78,
    };
  }

  // ── Configuration ──

  /**
   * Get the agent configuration.
   * @returns Current configuration (without sensitive data)
   */
  getConfig(): Pick<SocialAgentConfig, 'agentName' | 'brandName' | 'industry' | 'targetAudience' | 'managedPlatforms'> {
    return {
      agentName: this.config.agentName,
      brandName: this.config.brandName,
      industry: this.config.industry,
      targetAudience: this.config.targetAudience,
      managedPlatforms: this.config.managedPlatforms,
    };
  }

  /**
   * Get the system prompt with variables filled in.
   * @returns System prompt string
   */
  getSystemPrompt(): string {
    return `You are ${this.config.agentName}, the social media strategist and voice of ${this.config.brandName}.
You are an expert content creator who understands how to craft compelling,
platform-native content that drives engagement and builds community.

## YOUR IDENTITY
- You ARE the social media voice of ${this.config.brandName} - not an assistant,
  but the creative director behind every post, reply, and campaign.
- You have deep expertise in SaaS marketing, content strategy, and
  community management.
- You understand ${this.config.industry} deeply and know what resonates with
  ${this.config.targetAudience}.

## CONTENT PRINCIPLES
1. VALUE FIRST: Every post must give the reader something useful
2. AUTHENTICITY: Sound like a smart human, not a marketing bot
3. SPECIFICITY OVER GENERIC: Concrete examples, numbers, and stories
4. VISUAL THINKING: Use line breaks, emoji sparingly, scannable format
5. CONVERSATION, NOT BROADCAST: Write as if talking to one person

## TONE & VOICE
${this.config.brandVoiceDescription}

Current campaign context:
${this.config.activeCampaigns}

Upcoming events/content themes:
${this.config.contentCalendarUpcoming}`;
  }

  // ── Access to Sub-components ──

  /** Access the content engine directly */
  getContentEngine(): ContentEngine {
    return this.contentEngine;
  }

  /** Access the engagement manager directly */
  getEngagementManager(): EngagementManager {
    return this.engagementManager;
  }

  /** Access the campaign manager directly */
  getCampaignManager(): CampaignManager {
    return this.campaignManager;
  }
}

// ──────────────────────────────────────────────
// Factory Functions
// ──────────────────────────────────────────────

/**
 * Create a pre-configured SocialMediaAgent with sensible defaults.
 * @returns Configured agent instance
 */
export function createDefaultAgent(): SocialMediaAgent {
  return new SocialMediaAgent({
    agentName: 'Social Lead',
    brandName: 'FlowStack',
    industry: 'SaaS project management',
    targetAudience: 'startup founders, product managers, engineering leads',
    brandVoiceDescription:
      'Professional but approachable. Knowledgeable without being arrogant. Direct but not blunt. We sound like a smart colleague giving advice over coffee. We use data to back claims and always prefer specificity.',
  });
}

/**
 * Generate a complete mock dataset for development and testing.
 * @returns Mock dataset with posts, campaigns, and interactions
 */
export function generateMockData(): MockDataSet {
  const posts = generateMockPosts();
  const interactions = generateMockInteractions();

  // Create a content engine to get platform configs
  const engine = new ContentEngine();
  const platformConfigs = {
    twitter: engine.getPlatformConfig('twitter'),
    linkedin: engine.getPlatformConfig('linkedin'),
    facebook: engine.getPlatformConfig('facebook'),
    instagram: engine.getPlatformConfig('instagram'),
  };

  return {
    samplePosts: posts,
    sampleCampaigns: [
      {
        id: 'campaign_001',
        name: 'Q1 Smart Reports Launch',
        description: 'Multi-platform campaign announcing Smart Reports feature',
        objective: 'conversion',
        status: 'active',
        platforms: ['twitter', 'linkedin', 'facebook', 'instagram'],
        startDate: '2025-01-15T00:00:00Z',
        endDate: '2025-02-15T00:00:00Z',
        posts: posts.filter((p) => p.campaignId === 'campaign_001').map((p) => p.id),
        targetMetrics: {
          targetReach: 50000,
          targetEngagementRate: 4.0,
          targetClicks: 2500,
          targetConversions: 200,
          targetFollowerGrowth: 1000,
        },
        tags: ['product-launch', 'smart-reports'],
        utmCampaign: 'q1_smart_reports_launch',
        createdAt: '2025-01-08T00:00:00Z',
        updatedAt: '2025-01-15T00:00:00Z',
      },
      {
        id: 'campaign_002',
        name: 'Brand Awareness - Productivity Month',
        description: 'Thought leadership content for productivity awareness',
        objective: 'awareness',
        status: 'active',
        platforms: ['twitter', 'linkedin'],
        startDate: '2025-01-20T00:00:00Z',
        endDate: '2025-02-20T00:00:00Z',
        posts: posts.filter((p) => p.campaignId === 'campaign_002').map((p) => p.id),
        targetMetrics: {
          targetReach: 100000,
          targetEngagementRate: 3.0,
          targetClicks: 1500,
          targetConversions: 100,
          targetFollowerGrowth: 2500,
        },
        tags: ['awareness', 'productivity'],
        utmCampaign: 'productivity_month_awareness',
        createdAt: '2025-01-20T00:00:00Z',
        updatedAt: '2025-01-20T00:00:00Z',
      },
      {
        id: 'campaign_003',
        name: 'Webinar: Scaling Your SaaS Stack',
        description: 'Drive registrations for upcoming webinar',
        objective: 'event',
        status: 'draft',
        platforms: ['twitter', 'linkedin', 'facebook'],
        startDate: '2025-02-01T00:00:00Z',
        endDate: '2025-02-21T00:00:00Z',
        posts: [],
        targetMetrics: {
          targetReach: 25000,
          targetEngagementRate: 5.0,
          targetClicks: 1200,
          targetConversions: 300,
          targetFollowerGrowth: 500,
        },
        tags: ['webinar', 'saas-scaling'],
        utmCampaign: 'webinar_saas_stack_scaling',
        createdAt: '2025-01-25T00:00:00Z',
        updatedAt: '2025-01-25T00:00:00Z',
      },
      {
        id: 'campaign_004',
        name: 'Year-End Review Campaign',
        description: 'Celebrate customer wins and year-in-review',
        objective: 'engagement',
        status: 'completed',
        platforms: ['twitter', 'linkedin', 'instagram'],
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T00:00:00Z',
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
        tags: ['year-end', 'review'],
        utmCampaign: 'year_end_review_2024',
        createdAt: '2024-11-15T00:00:00Z',
        updatedAt: '2024-12-31T00:00:00Z',
      },
    ],
    sampleInteractions: interactions,
    sampleTemplates: engine.getAllTemplates(),
    platformConfigs,
    hashtagStrategy: {
      branded: ['#FlowStack', '#FlowStackTips', '#BuiltWithFlowStack'],
      industry: ['#SaaS', '#ProductManagement', '#TeamCollaboration'],
      topic: ['#Productivity', '#RemoteWork', '#Agile', '#Workflow'],
      community: ['#TechTwitter', '#SaaSFounders', '#StartupLife'],
      campaign: ['#FlowStackLaunch', '#NewAtFlowStack'],
      trending: [],
    },
  };
}

/** Default export is the main agent class */
export default SocialMediaAgent;
