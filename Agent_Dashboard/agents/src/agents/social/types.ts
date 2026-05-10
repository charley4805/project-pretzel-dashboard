/**
 * Social Media Agent - Type Definitions
 * Core types, interfaces and enums for the social media agent module.
 */

/** Supported social media platforms */
export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

/** Content type classification */
export type ContentType =
  | 'educational'
  | 'promotional'
  | 'engagement'
  | 'user_generated'
  | 'company_culture';

/** Educational content sub-types */
export type EducationalSubType = 'tip' | 'how_to' | 'myth_busting' | 'data_insight';

/** Promotional content sub-types */
export type PromotionalSubType =
  | 'feature_announcement'
  | 'case_study'
  | 'product_tip'
  | 'limited_time_offer';

/** Engagement content sub-types */
export type EngagementSubType = 'poll' | 'question' | 'fill_in_blank' | 'behind_scenes' | 'trend';

/** Campaign lifecycle status */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

/** Post lifecycle status */
export type PostStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed';

/** Interaction types from audience */
export type InteractionType =
  | 'comment_positive'
  | 'comment_question'
  | 'comment_complaint'
  | 'comment_spam'
  | 'comment_competitor_mention'
  | 'mention_positive'
  | 'mention_question'
  | 'mention_complaint'
  | 'mention_comparison'
  | 'dm_sales_inquiry'
  | 'dm_support_request'
  | 'dm_partnership'
  | 'dm_spam'
  | 'share_retweet'
  | 'share_industry';

/** Action types for engagement responses */
export type ActionType =
  | 'reply'
  | 'reply_and_dm'
  | 'like'
  | 'like_and_reply'
  | 'like_and_share'
  | 'share_retweet'
  | 'hide'
  | 'block'
  | 'ignore'
  | 'flag_for_review'
  | 'route_to_sales'
  | 'route_to_support'
  | 'route_to_partnerships'
  | 'thank';

/** Campaign objective types */
export type CampaignObjective = 'awareness' | 'engagement' | 'conversion' | 'event' | 'seasonal';

/** Approval decision types */
export type ApprovalDecision = 'auto_approved' | 'needs_review' | 'human_only' | 'approved' | 'rejected' | 'edited';

/** Hashtag category for organization */
export type HashtagCategory = 'branded' | 'industry' | 'topic' | 'community' | 'campaign' | 'trending';

/** Screening issue severity */
export type IssueSeverity = 'error' | 'warning' | 'info';

/** Screening issue category */
export type IssueCategory =
  | 'prohibited_content'
  | 'sensitive_topic'
  | 'unverified_claim'
  | 'brand_voice'
  | 'competitor_bashing'
  | 'missing_disclosure'
  | 'length_exceeded'
  | 'hashtag_count';

// ──────────────────────────────────────────────
// Core Data Models
// ──────────────────────────────────────────────

/** Represents a single social media post */
export interface SocialPost {
  id: string;
  content: string;
  platform: SocialPlatform;
  type: ContentType;
  subType?: EducationalSubType | PromotionalSubType | EngagementSubType;
  status: PostStatus;
  campaignId?: string;
  /** Associated media assets (image prompts, URLs) */
  mediaAssets?: string[];
  /** Recommended hashtags */
  hashtags?: string[];
  /** UTM-tracked links */
  links?: string[];
  /** Best posting time (ISO-8601) */
  scheduledTime?: string;
  /** Actual published time */
  publishedAt?: string;
  /** Platform-specific native ID after publishing */
  platformPostId?: string;
  /** Author / agent identifier */
  authorId: string;
  /** Engagement metrics (updated post-publish) */
  metrics?: PostMetrics;
  /** Screening result before publishing */
  screeningResult?: ScreeningResult;
  /** ISO-8601 timestamps */
  createdAt: string;
  updatedAt: string;
}

/** Post performance metrics */
export interface PostMetrics {
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  saves?: number;
  engagementRate: number;
  clickThroughRate: number;
  sentimentScore: number;
}

/** A content template for generating posts */
export interface ContentTemplate {
  id: string;
  name: string;
  contentType: ContentType;
  subType?: EducationalSubType | PromotionalSubType | EngagementSubType;
  platform: SocialPlatform;
  /** Template string with placeholders like {{topic}} */
  template: string;
  /** Example output for reference */
  example: string;
  /** Variables this template requires */
  variables: string[];
  /** Max character limit for target platform */
  maxLength: number;
  /** Default hashtags to include */
  defaultHashtags?: string[];
  /** Whether this template requires approval */
  requiresApproval: boolean;
}

/** Represents a marketing campaign */
export interface Campaign {
  id: string;
  name: string;
  description: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  /** Target platforms for this campaign */
  platforms: SocialPlatform[];
  /** Campaign start date (ISO-8601) */
  startDate: string;
  /** Campaign end date (ISO-8601) */
  endDate: string;
  /** Posts belonging to this campaign */
  posts: string[];
  /** Target metrics for success measurement */
  targetMetrics: CampaignTargetMetrics;
  /** Actual aggregated metrics */
  actualMetrics?: CampaignMetrics;
  /** Campaign theme/topic tags */
  tags: string[];
  /** UTM campaign parameter */
  utmCampaign: string;
  /** Budget allocation per platform */
  budget?: Record<SocialPlatform, number>;
  createdAt: string;
  updatedAt: string;
}

/** Target metrics for a campaign */
export interface CampaignTargetMetrics {
  targetReach: number;
  targetEngagementRate: number;
  targetClicks: number;
  targetConversions: number;
  targetFollowerGrowth: number;
}

/** Aggregated campaign metrics */
export interface CampaignMetrics {
  totalReach: number;
  totalImpressions: number;
  totalEngagements: number;
  totalClicks: number;
  totalConversions: number;
  engagementRate: number;
  clickThroughRate: number;
  costPerClick?: number;
  followerGrowth: number;
  sentimentScore: number;
}

/** An engagement interaction from a user */
export interface EngagementInteraction {
  id: string;
  targetPostId?: string;
  type: InteractionType;
  platform: SocialPlatform;
  platformInteractionId: string;
  user: SocialUser;
  content: string;
  toxicityScore?: number;
  sentimentScore?: number;
  actionTaken?: ActionType;
  replyContent?: string;
  resolved: boolean;
  responseTimeMinutes?: number;
  createdAt: string;
  resolvedAt?: string;
}

/** A social media user / follower */
export interface SocialUser {
  id: string;
  platformUserId: string;
  platform: SocialPlatform;
  displayName: string;
  handle: string;
  followerCount?: number;
  isVerified?: boolean;
  isPartner?: boolean;
  isInfluencer?: boolean;
  interactionHistory?: string[];
}

/** Result of content compliance screening */
export interface ScreeningResult {
  approved: boolean;
  issues: ScreeningIssue[];
  requiresHumanReview: boolean;
  confidenceScore: number;
  recommendedDecision: ApprovalDecision;
  screenedAt: string;
}

/** A single screening issue */
export interface ScreeningIssue {
  category: IssueCategory;
  severity: IssueSeverity;
  message: string;
  trigger?: string;
  suggestion?: string;
}

/** Platform-specific configuration */
export interface PlatformConfig {
  platform: SocialPlatform;
  maxCharacters: number;
  bestDays: number[];
  bestTimesUtc: string[];
  maxHashtags: number;
  hashtagPlacement: 'inline' | 'end' | 'first_comment';
  preferredHashtagTypes: HashtagCategory[];
  supportsThreads: boolean;
  mediaRequired: boolean;
  toneCalibration: ToneCalibration;
}

/** Voice tone calibration per platform */
export interface ToneCalibration {
  formality: number;
  technicalDepth: number;
  wit: number;
  brevity: number;
  visualLanguage: number;
  storytelling: number;
  conversational: number;
  helpfulness: number;
}

/** Content creation request */
export interface ContentRequest {
  type: ContentType;
  subType?: EducationalSubType | PromotionalSubType | EngagementSubType;
  topic: string;
  platform: SocialPlatform;
  campaignId?: string;
  audienceSegment?: string;
  instructions?: string;
  keywords?: string[];
  includeCta?: boolean;
  ctaText?: string;
}

/** Post schedule configuration */
export interface ScheduleConfig {
  targetTimezone?: string;
  preferredTime?: string;
  respectCampaignSequence: boolean;
  maxPostsPerDay?: number;
  blackoutDates?: string[];
}

/** Campaign creation configuration */
export interface CampaignConfig {
  name: string;
  description: string;
  objective: CampaignObjective;
  platforms: SocialPlatform[];
  startDate: string;
  endDate: string;
  targetMetrics: CampaignTargetMetrics;
  contentThemes?: string[];
  postCount?: number;
  utmCampaign: string;
  tags?: string[];
  budget?: Record<SocialPlatform, number>;
}

/** Voice profile for brand calibration */
export interface VoiceProfile {
  knowledgeable: number;
  approachable: number;
  direct: number;
  authentic: number;
  energetic: number;
  helpfulness: number;
  enthusiasm: number;
  conversational: number;
  dataDriven: number;
  scrappy: number;
  empathetic: number;
  formality: number;
  technicalDepth: number;
  wit: number;
  brevity: number;
  visualLanguage: number;
  storytelling: number;
}

/** Hashtag strategy configuration */
export interface HashtagStrategy {
  branded: string[];
  industry: string[];
  topic: string[];
  community: string[];
  campaign: string[];
  trending: string[];
}

/** Toxicity analysis result */
export interface ToxicityResult {
  score: number;
  categories: ToxicityCategory[];
}

/** Toxicity category detection */
export interface ToxicityCategory {
  category: string;
  score: number;
}

/** Optimal posting time result */
export interface OptimalTimeResult {
  platform: SocialPlatform;
  suggestedTimeUtc: string;
  suggestedTimeLocal?: string;
  confidence: number;
  reason: string;
}

/** Analytics summary for reporting */
export interface AnalyticsSummary {
  period: { start: string; end: string };
  platformBreakdown: Record<SocialPlatform, PlatformAnalytics>;
  topPerformingPosts: string[];
  totalEngagements: number;
  totalReach: number;
  followerGrowth: number;
  avgResponseTimeMinutes: number;
  sentimentScore: number;
}

/** Per-platform analytics */
export interface PlatformAnalytics {
  postsPublished: number;
  reach: number;
  impressions: number;
  engagements: number;
  engagementRate: number;
  clicks: number;
  clickThroughRate: number;
  followerGrowth: number;
  bestPerformingContentType: ContentType;
}

/** Mock data container for development/testing */
export interface MockDataSet {
  samplePosts: SocialPost[];
  sampleCampaigns: Campaign[];
  sampleInteractions: EngagementInteraction[];
  sampleTemplates: ContentTemplate[];
  platformConfigs: Record<SocialPlatform, PlatformConfig>;
  hashtagStrategy: HashtagStrategy;
}
