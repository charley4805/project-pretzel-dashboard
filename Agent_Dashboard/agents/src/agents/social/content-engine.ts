/**
 * Content Engine - Social Media Agent
 * Handles content creation, platform adaptation, and compliance screening
 * for social media posts across Twitter/X, LinkedIn, Facebook, and Instagram.
 */

import {
  type SocialPlatform,
  type ContentType,
  type EducationalSubType,
  type PromotionalSubType,
  type EngagementSubType,
  type SocialPost,
  type ContentTemplate,
  type ScreeningResult,
  type ScreeningIssue,
  type ContentRequest,
  type PlatformConfig,
  type HashtagStrategy,
} from './types';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** Prohibited regex patterns for content screening */
const PROHIBITED_PATTERNS: Array<{ pattern: RegExp; message: string; suggestion?: string }> = [
  { pattern: /guarantee.*results?/i, message: 'Unverified claim: guarantee of results', suggestion: 'Use specific case study data instead' },
  { pattern: /best.*ever/i, message: 'Superlative without proof: "best ever"', suggestion: 'Add data backing or use "one of the best"' },
  { pattern: /\b(secret|insider)\b/i, message: 'Confidential language detected', suggestion: 'Use "tip" or "best practice" instead' },
  { pattern: /\bworse\b.*\b(than|compared)\b/i, message: 'Potential competitor bashing', suggestion: 'Focus on your strengths, not competitor weaknesses' },
  { pattern: /\b(lawsuit|legal action)\b/i, message: 'Legal reference detected', suggestion: 'Consult legal team before referencing legal matters' },
  { pattern: /\b(medical|health|financial)\b\s+\b(advice|tip)\b/i, message: 'Regulated advice domain', suggestion: 'Add disclaimer or avoid giving specific advice' },
  { pattern: /100%\s+(guaranteed|effective)/i, message: 'Absolute claim without proof', suggestion: 'Use quantifiable results from studies' },
  { pattern: /\bmiracle\b|\bmagic\b/i, message: 'Hype language not aligned with brand voice', suggestion: 'Use concrete benefit descriptions' },
];

/** Sensitive topics requiring extra scrutiny */
const SENSITIVE_TOPICS = [
  'politics', 'religion', 'controversial events',
  'tragedy', 'crisis', 'layoffs', 'funding',
  'acquisition', 'bankruptcy', 'lawsuit',
];

/** Default hashtag strategy */
const DEFAULT_HASHTAG_STRATEGY: HashtagStrategy = {
  branded: ['#FlowStack', '#FlowStackTips', '#BuiltWithFlowStack'],
  industry: ['#SaaS', '#ProductManagement', '#TeamCollaboration'],
  topic: ['#Productivity', '#RemoteWork', '#Agile', '#Workflow'],
  community: ['#TechTwitter', '#SaaSFounders', '#StartupLife'],
  campaign: ['#FlowStackLaunch', '#NewAtFlowStack'],
  trending: [],
};

/** Platform configurations for content adaptation */
const PLATFORM_CONFIGS: Record<SocialPlatform, PlatformConfig> = {
  twitter: {
    platform: 'twitter',
    maxCharacters: 280,
    bestDays: [2, 3, 4],
    bestTimesUtc: ['12:00', '17:00'],
    maxHashtags: 2,
    hashtagPlacement: 'inline',
    preferredHashtagTypes: ['topic', 'community'],
    supportsThreads: true,
    mediaRequired: false,
    toneCalibration: {
      formality: -0.2,
      technicalDepth: 0.0,
      wit: 0.3,
      brevity: 0.4,
      visualLanguage: 0.1,
      storytelling: 0.1,
      conversational: 0.2,
      helpfulness: 0.2,
    },
  },
  linkedin: {
    platform: 'linkedin',
    maxCharacters: 3000,
    bestDays: [2, 3, 4],
    bestTimesUtc: ['08:00', '12:00'],
    maxHashtags: 5,
    hashtagPlacement: 'end',
    preferredHashtagTypes: ['industry', 'topic', 'branded'],
    supportsThreads: true,
    mediaRequired: false,
    toneCalibration: {
      formality: 0.3,
      technicalDepth: 0.2,
      wit: 0.0,
      brevity: -0.2,
      visualLanguage: 0.0,
      storytelling: 0.2,
      conversational: 0.0,
      helpfulness: 0.2,
    },
  },
  facebook: {
    platform: 'facebook',
    maxCharacters: 63206,
    bestDays: [3, 4, 5],
    bestTimesUtc: ['13:00', '15:00'],
    maxHashtags: 2,
    hashtagPlacement: 'end',
    preferredHashtagTypes: ['community', 'topic'],
    supportsThreads: false,
    mediaRequired: false,
    toneCalibration: {
      formality: -0.1,
      technicalDepth: -0.1,
      wit: 0.1,
      brevity: -0.3,
      visualLanguage: 0.1,
      storytelling: 0.2,
      conversational: 0.3,
      helpfulness: 0.2,
    },
  },
  instagram: {
    platform: 'instagram',
    maxCharacters: 2200,
    bestDays: [1, 2, 3, 4, 5],
    bestTimesUtc: ['11:00', '14:00'],
    maxHashtags: 10,
    hashtagPlacement: 'first_comment',
    preferredHashtagTypes: ['branded', 'topic', 'community'],
    supportsThreads: true,
    mediaRequired: true,
    toneCalibration: {
      formality: -0.1,
      technicalDepth: 0.0,
      wit: 0.1,
      brevity: -0.1,
      visualLanguage: 0.4,
      storytelling: 0.3,
      conversational: 0.2,
      helpfulness: 0.1,
    },
  },
};

// ──────────────────────────────────────────────
// Content Engine Class
// ──────────────────────────────────────────────

/**
 * ContentEngine generates, adapts, and screens social media content
 * across multiple platforms with brand voice consistency.
 */
export class ContentEngine {
  private hashtagStrategy: HashtagStrategy;
  private platformConfigs: Record<SocialPlatform, PlatformConfig>;
  private templates: Map<string, ContentTemplate>;
  private posts: Map<string, SocialPost>;

  constructor(
    hashtagStrategy: HashtagStrategy = DEFAULT_HASHTAG_STRATEGY,
    platformConfigs: Record<SocialPlatform, PlatformConfig> = PLATFORM_CONFIGS
  ) {
    this.hashtagStrategy = hashtagStrategy;
    this.platformConfigs = platformConfigs;
    this.templates = new Map();
    this.posts = new Map();
    this.initializeTemplates();
  }

  // ── Template Initialization ──

  /** Load built-in content templates for all types and platforms */
  private initializeTemplates(): void {
    const templateDefs = this.getTemplateDefinitions();

    for (const def of templateDefs) {
      const template: ContentTemplate = {
        id: def.key,
        name: def.name ?? 'Untitled Template',
        contentType: def.contentType as ContentType,
        subType: def.subType as EducationalSubType | PromotionalSubType | EngagementSubType,
        platform: def.platform as SocialPlatform,
        template: def.template ?? '',
        example: def.example ?? '',
        variables: def.variables ?? [],
        maxLength: def.maxLength ?? 280,
        defaultHashtags: def.defaultHashtags,
        requiresApproval: def.requiresApproval ?? false,
      };
      this.templates.set(def.key, template);
    }
  }

  /** Get all template definitions */
  private getTemplateDefinitions(): Array<Partial<ContentTemplate> & { key: string }> {
    return [
      {
        key: 'edu_tip_twitter',
        name: 'Educational Tip - Twitter',
        contentType: 'educational',
        subType: 'tip',
        platform: 'twitter',
        template: '{{count}} things that {{benefit}}:\n\n{{bullet_list}}\n\nThe goal isn\'t {{common_mistake}}.\nIt\'s {{better_approach}}.\n\nWhat rule does your team swear by?',
        example: '3 things that made our standups go from 30 min to 10:\n\n1. No laptops\n2. Only 3 questions\n3. Blockers addressed after\n\nThe goal isn\'t to solve problems in the standup. It\'s to identify them fast.',
        variables: ['count', 'benefit', 'bullet_list', 'common_mistake', 'better_approach'],
        maxLength: 280,
        defaultHashtags: ['#Productivity'],
        requiresApproval: false,
      },
      {
        key: 'edu_tip_linkedin',
        name: 'Educational Tip - LinkedIn',
        contentType: 'educational',
        subType: 'tip',
        platform: 'linkedin',
        template: 'I {{experience}}.\n\n{{count}} things I learned about {{topic}}:\n\n{{bullet_list}}\n\nThe key insight: {{insight}}\n\nWhat would you add?\n\n#ProductManagement #SaaS',
        example: 'I scaled a team from 5 to 50 engineers.\n\n3 things I learned about management...',
        variables: ['experience', 'count', 'topic', 'bullet_list', 'insight'],
        maxLength: 1300,
        defaultHashtags: ['#ProductManagement', '#SaaS'],
        requiresApproval: false,
      },
      {
        key: 'edu_howto_twitter',
        name: 'How-To Guide - Twitter',
        contentType: 'educational',
        subType: 'how_to',
        platform: 'twitter',
        template: 'Stop {{bad_approach}}.\n\nHere\'s how to {{topic}} in {{timeframe}}:\n\n{{step_list}}\n\n{{closing}}',
        example: 'Stop manually copying data.\n\nHere\'s how to automate reports in 5 min:\n\nStep 1: Connect source\nStep 2: Choose metrics\nStep 3: Schedule\n\nYour future self will thank you.',
        variables: ['bad_approach', 'topic', 'timeframe', 'step_list', 'closing'],
        maxLength: 280,
        defaultHashtags: ['#Productivity'],
        requiresApproval: false,
      },
      {
        key: 'edu_howto_linkedin',
        name: 'How-To Guide - LinkedIn',
        contentType: 'educational',
        subType: 'how_to',
        platform: 'linkedin',
        template: 'Stop {{bad_approach}}.\n\nHere\'s how to {{topic}} in {{timeframe}}:\n\n{{step_list}}\n\n{{closing}}\n\nFull guide: {{link}}\n\n#ProductManagement #SaaS',
        example: 'Stop manually copying data.\n\nHere\'s how to automate reports in 5 min:\n\nStep 1-5...',
        variables: ['bad_approach', 'topic', 'timeframe', 'step_list', 'closing', 'link'],
        maxLength: 1300,
        defaultHashtags: ['#ProductManagement', '#SaaS'],
        requiresApproval: false,
      },
      {
        key: 'promo_feature_twitter',
        name: 'Feature Announcement - Twitter',
        contentType: 'promotional',
        subType: 'feature_announcement',
        platform: 'twitter',
        template: 'Introducing {{feature_name}} - {{one_line_benefit}}\n\n{{description}}\n\nTry it: {{link}}',
        example: 'Introducing Smart Reports - automated insights in one click.\n\nWhat used to take hours now takes seconds.\n\nTry it: link',
        variables: ['feature_name', 'one_line_benefit', 'description', 'link'],
        maxLength: 280,
        defaultHashtags: ['#ProductUpdate'],
        requiresApproval: true,
      },
      {
        key: 'promo_feature_linkedin',
        name: 'Feature Announcement - LinkedIn',
        contentType: 'promotional',
        subType: 'feature_announcement',
        platform: 'linkedin',
        template: 'Today we\'re introducing {{feature_name}} - {{one_line_benefit}}\n\n{{description}}\n\nKey benefits:\n{{benefit_list}}\n\nFull details: {{link}}\n\n#SaaS #ProductManagement',
        example: 'Today we\'re introducing Smart Reports...',
        variables: ['feature_name', 'one_line_benefit', 'description', 'benefit_list', 'link'],
        maxLength: 1300,
        defaultHashtags: ['#SaaS', '#ProductManagement'],
        requiresApproval: true,
      },
      {
        key: 'promo_case_linkedin',
        name: 'Case Study - LinkedIn',
        contentType: 'promotional',
        subType: 'case_study',
        platform: 'linkedin',
        template: '{{company}} was spending {{hours}} on {{problem}}.\n\nIn {{timeframe}} using {{solution}}, they:\n{{result_list}}\n\nHere\'s exactly how: {{link}}\n\nWhat metric would move the needle for your team?',
        example: 'Acme Corp was spending 20h/week on reporting.\n\nIn 30 days using FlowStack, they:\n- Cut reporting time by 70%\n- Improved accuracy\n\nWhat metric would move the needle?',
        variables: ['company', 'hours', 'problem', 'timeframe', 'solution', 'result_list', 'link'],
        maxLength: 1300,
        defaultHashtags: ['#CaseStudy', '#SaaS'],
        requiresApproval: true,
      },
      {
        key: 'eng_poll_twitter',
        name: 'Poll - Twitter',
        contentType: 'engagement',
        subType: 'poll',
        platform: 'twitter',
        template: '{{question}}\n\n{{options}}\n\nVote below - I\'ll share the results tomorrow.',
        example: 'What\'s your biggest productivity killer?\n\n1. Notifications\n2. Meetings\n3. Context switching\n4. Email',
        variables: ['question', 'options'],
        maxLength: 280,
        defaultHashtags: ['#Poll'],
        requiresApproval: false,
      },
      {
        key: 'eng_question_linkedin',
        name: 'Question - LinkedIn',
        contentType: 'engagement',
        subType: 'question',
        platform: 'linkedin',
        template: '{{question}}\n\nMy take: {{opinion}}\n\nWhat\'s your experience? Drop yours below.',
        example: 'What\'s the best piece of career advice you\'ve received?\n\nMy take: Focus on being valuable, not busy.',
        variables: ['question', 'opinion'],
        maxLength: 1300,
        defaultHashtags: ['#CareerAdvice', '#SaaS'],
        requiresApproval: false,
      },
      {
        key: 'eng_bts_instagram',
        name: 'Behind the Scenes - Instagram',
        contentType: 'engagement',
        subType: 'behind_scenes',
        platform: 'instagram',
        template: 'Building {{feature}} behind the scenes:\n\n{{story}}\n\nSwipe to see the process {{emoji}}\n\nWhat features would you like to see next?',
        example: 'Building Smart Reports behind the scenes:\n\n3 months, 12 iterations, and one breakthrough moment.',
        variables: ['feature', 'story', 'emoji'],
        maxLength: 2200,
        defaultHashtags: ['#BehindTheScenes', '#StartupLife', '#SaaS'],
        requiresApproval: false,
      },
    ];
  }

  // ── Public Content Creation Methods ──

  /**
   * Create a new social media post of the specified type.
   * @param request - Content creation request parameters
   * @returns Generated SocialPost ready for screening and scheduling
   */
  createPost(request: ContentRequest): SocialPost {
    const { type, subType, topic, platform, campaignId } = request;

    switch (type) {
      case 'educational':
        return this.generateEducationalPost(topic, platform, subType as EducationalSubType ?? 'tip', campaignId);
      case 'promotional':
        return this.generatePromotionalPost(topic, platform, subType as PromotionalSubType ?? 'feature_announcement', campaignId);
      case 'engagement':
        return this.generateEngagementPost(topic as EngagementSubType ?? 'question', platform, campaignId);
      case 'user_generated':
        return this.generateUserGeneratedPost(topic, platform, campaignId);
      case 'company_culture':
        return this.generateCompanyCulturePost(topic, platform, campaignId);
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }

  /**
   * Generate an educational post (tips, how-tos, myth-busting, data insights).
   * @param topic - The subject matter
   * @param platform - Target platform
   * @param subType - Specific educational format
   * @param campaignId - Optional campaign association
   * @returns Generated educational SocialPost
   */
  generateEducationalPost(
    topic: string,
    platform: SocialPlatform,
    subType: EducationalSubType = 'tip',
    campaignId?: string
  ): SocialPost {
    const templates = this.findTemplates('educational', subType, platform);
    const template = templates[0] ?? this.getFallbackTemplate(platform);
    const now = new Date().toISOString();

    let content = '';
    switch (subType) {
      case 'tip':
        content = this.renderTipPost(topic, platform, template);
        break;
      case 'how_to':
        content = this.renderHowToPost(topic, platform, template);
        break;
      case 'myth_busting':
        content = this.renderMythBustingPost(topic, platform);
        break;
      case 'data_insight':
        content = this.renderDataInsightPost(topic, platform);
        break;
    }

    content = this.adaptForPlatform(content, platform);
    const hashtags = this.selectHashtags(platform, 'educational', topic);

    const post: SocialPost = {
      id: this.generateId('post'),
      content,
      platform,
      type: 'educational',
      subType,
      status: 'draft',
      campaignId,
      hashtags,
      authorId: 'social-agent',
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(post.id, post);
    return post;
  }

  /**
   * Generate a promotional post (feature announcements, case studies, offers).
   * @param feature - Feature name or promotional topic
   * @param platform - Target platform
   * @param subType - Specific promotional format
   * @param campaignId - Optional campaign association
   * @returns Generated promotional SocialPost
   */
  generatePromotionalPost(
    feature: string,
    platform: SocialPlatform,
    subType: PromotionalSubType = 'feature_announcement',
    campaignId?: string
  ): SocialPost {
    const templates = this.findTemplates('promotional', subType, platform);
    const template = templates[0] ?? this.getFallbackTemplate(platform);
    const now = new Date().toISOString();

    let content = '';
    switch (subType) {
      case 'feature_announcement':
        content = this.renderFeatureAnnouncement(feature, platform, template);
        break;
      case 'case_study':
        content = this.renderCaseStudy(feature, platform);
        break;
      case 'product_tip':
        content = this.renderProductTip(feature, platform);
        break;
      case 'limited_time_offer':
        content = this.renderLimitedTimeOffer(feature, platform);
        break;
    }

    content = this.adaptForPlatform(content, platform);
    const hashtags = this.selectHashtags(platform, 'promotional', feature);

    const post: SocialPost = {
      id: this.generateId('post'),
      content,
      platform,
      type: 'promotional',
      subType,
      status: 'draft',
      campaignId,
      hashtags,
      authorId: 'social-agent',
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(post.id, post);
    return post;
  }

  /**
   * Generate an engagement post (polls, questions, behind-the-scenes).
   * @param type - Engagement sub-type
   * @param platform - Target platform
   * @param campaignId - Optional campaign association
   * @returns Generated engagement SocialPost
   */
  generateEngagementPost(
    type: EngagementSubType = 'question',
    platform: SocialPlatform,
    campaignId?: string
  ): SocialPost {
    const templates = this.findTemplates('engagement', type, platform);
    const template = templates[0] ?? this.getFallbackTemplate(platform);
    const now = new Date().toISOString();

    let content = '';
    switch (type) {
      case 'poll':
        content = this.renderPollPost(platform, template);
        break;
      case 'question':
        content = this.renderQuestionPost(platform, template);
        break;
      case 'fill_in_blank':
        content = this.renderFillInBlankPost(platform);
        break;
      case 'behind_scenes':
        content = this.renderBehindTheScenesPost(platform, template);
        break;
      case 'trend':
        content = this.renderTrendPost(platform);
        break;
    }

    content = this.adaptForPlatform(content, platform);
    const hashtags = this.selectHashtags(platform, 'engagement', type);

    const post: SocialPost = {
      id: this.generateId('post'),
      content,
      platform,
      type: 'engagement',
      subType: type,
      status: 'draft',
      campaignId,
      hashtags,
      authorId: 'social-agent',
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(post.id, post);
    return post;
  }

  /**
   * Adapt content for a specific platform's format rules and tone.
   * @param content - Raw content to adapt
   * @param platform - Target platform
   * @returns Platform-optimized content
   */
  adaptForPlatform(content: string, platform: SocialPlatform): string {
    const config = this.platformConfigs[platform];
    let adapted = content;

    switch (platform) {
      case 'twitter':
        adapted = this.adaptForTwitter(adapted, config);
        break;
      case 'linkedin':
        adapted = this.adaptForLinkedIn(adapted, config);
        break;
      case 'facebook':
        adapted = this.adaptForFacebook(adapted, config);
        break;
      case 'instagram':
        adapted = this.adaptForInstagram(adapted, config);
        break;
    }

    return adapted;
  }

  /**
   * Screen content against brand guidelines and compliance rules.
   * @param content - The content to screen
   * @returns ScreeningResult with approval status and any issues
   */
  screenContent(content: string): ScreeningResult {
    const issues: ScreeningIssue[] = [];
    const lowerContent = content.toLowerCase();

    // Check prohibited patterns
    for (const { pattern, message, suggestion } of PROHIBITED_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          category: 'prohibited_content',
          severity: 'error',
          message,
          trigger: content.match(pattern)?.[0],
          suggestion,
        });
      }
    }

    // Check sensitive topics
    for (const topic of SENSITIVE_TOPICS) {
      if (lowerContent.includes(topic)) {
        issues.push({
          category: 'sensitive_topic',
          severity: 'warning',
          message: `Sensitive topic detected: "${topic}"`,
          trigger: topic,
          suggestion: 'Consider if this topic requires executive approval',
        });
      }
    }

    // Check hashtag count per platform
    const hashtagCount = (content.match(/#/g) ?? []).length;
    for (const [pltKey, cfg] of Object.entries(this.platformConfigs)) {
      if (hashtagCount > cfg.maxHashtags) {
        issues.push({
          category: 'hashtag_count',
          severity: 'warning',
          message: `Too many hashtags for ${pltKey} (${hashtagCount} > ${cfg.maxHashtags})`,
          trigger: `${hashtagCount} hashtags`,
          suggestion: `Limit to ${cfg.maxHashtags} hashtags for ${pltKey}`,
        });
      }
    }

    const confidenceScore = this.calculateConfidenceScore(content, issues);
    const approved = !issues.some((i) => i.severity === 'error');
    const requiresHumanReview = issues.some(
      (i) => i.severity === 'warning' || i.category === 'sensitive_topic'
    );

    let recommendedDecision: import('./types').ApprovalDecision;
    if (!approved) {
      recommendedDecision = 'human_only';
    } else if (requiresHumanReview) {
      recommendedDecision = 'needs_review';
    } else {
      recommendedDecision = 'auto_approved';
    }

    return {
      approved,
      issues,
      requiresHumanReview,
      confidenceScore,
      recommendedDecision,
      screenedAt: new Date().toISOString(),
    };
  }

  // ── Platform Adaptation Methods ──

  private adaptForTwitter(content: string, config: PlatformConfig): string {
    let adapted = content;
    if (adapted.length > config.maxCharacters) {
      adapted = adapted.substring(0, config.maxCharacters - 10) + '\n\n(Thread)';
    }
    const hashtags = adapted.match(/#\w+/g) ?? [];
    if (hashtags.length > config.maxHashtags) {
      adapted = adapted.replace(new RegExp(`\\s*${hashtags.slice(config.maxHashtags).join('\\s*')}`, 'g'), '');
    }
    adapted = adapted.replace(/\.\s+/g, '.\n');
    adapted = adapted.replace(/\n{3,}/g, '\n\n').trim();
    return adapted;
  }

  private adaptForLinkedIn(content: string, _cfg: PlatformConfig): string {
    let adapted = content;
    const hashtags = adapted.match(/#\w+/g) ?? [];
    if (hashtags.length < 3) {
      const additional = ['#SaaS', '#ProductManagement', '#TeamCollaboration'].slice(0, 3 - hashtags.length);
      adapted += '\n\n' + additional.join(' ');
    }
    adapted = adapted.replace(/([.!?])\s+/g, '$1\n');
    adapted = adapted.replace(/\n{3,}/g, '\n\n').trim();
    return adapted;
  }

  private adaptForFacebook(content: string, config: PlatformConfig): string {
    let adapted = content;
    adapted = adapted.replace(/Introducing/g, "We're excited to introduce");
    const hashtags = adapted.match(/#\w+/g) ?? [];
    if (hashtags.length > config.maxHashtags) {
      for (const tag of hashtags.slice(config.maxHashtags)) {
        adapted = adapted.replace(new RegExp(`\\s*${tag}`), '');
      }
    }
    adapted = adapted.replace(/\n{3,}/g, '\n\n').trim();
    return adapted;
  }

  private adaptForInstagram(content: string, _config: PlatformConfig): string {
    let adapted = content;
    adapted = adapted.replace(/^(\w+)/, '✨ $1');
    const hashtags = adapted.match(/#\w+/g) ?? [];
    if (hashtags.length > 0) {
      adapted = adapted.replace(new RegExp(`\\s*${hashtags.join('\\s*')}`, 'g'), '');
      adapted += '\n\n[Hashtags in first comment]: ' + hashtags.join(' ');
    }
    adapted = adapted.replace(/important/gi, 'important 💡');
    adapted = adapted.replace(/\n{3,}/g, '\n\n').trim();
    return adapted;
  }

  // ── Content Rendering Helpers ──

  private renderTipPost(topic: string, _platform: SocialPlatform, template: ContentTemplate): string {
    const count = '3';
    const benefit = topic;
    const bullets = '1. No laptops/phones\n2. Only 3 questions\n3. Blockers addressed after';
    const mistake = 'to solve everything in the meeting';
    const approach = 'to identify blockers fast';

    return template.template
      .replace(/{{count}}/g, count)
      .replace(/{{benefit}}/g, benefit)
      .replace(/{{bullet_list}}/g, bullets)
      .replace(/{{common_mistake}}/g, mistake)
      .replace(/{{better_approach}}/g, approach);
  }

  private renderHowToPost(topic: string, _platform: SocialPlatform, template: ContentTemplate): string {
    const badApproach = 'doing this manually';
    const timeframe = '5 minutes';
    const steps = 'Step 1: Connect your data\nStep 2: Choose metrics\nStep 3: Set the schedule\nStep 4: Add recipients\nStep 5: Publish';
    const closing = "What's your biggest automation win?";

    return template.template
      .replace(/{{bad_approach}}/g, badApproach)
      .replace(/{{topic}}/g, topic)
      .replace(/{{timeframe}}/g, timeframe)
      .replace(/{{step_list}}/g, steps)
      .replace(/{{closing}}/g, closing);
  }

  private renderMythBustingPost(topic: string, _platform: SocialPlatform): string {
    return `"${topic} doesn't work."\n\nWe've heard this for years.\n\nBut the data tells a different story:\n\n- Deep work hours: +40%\n- Meeting time: -25%\n- Satisfaction: +35%\n\nThe problem isn't ${topic}.\nIt's poor implementation.\n\nWhat myth would you like us to bust next?`;
  }

  private renderDataInsightPost(topic: string, _platform: SocialPlatform): string {
    return `We analyzed 50,000 data points on ${topic}.\n\n68% of failures come from ONE thing:\n\nNot bad planning.\nNot bad execution.\n\nBad communication.\n\nTeams that communicate daily are 3x more likely to deliver on time.\n\nThe fix is simpler than you think.\n\n[Link to full report]`;
  }

  private renderFeatureAnnouncement(feature: string, _platform: SocialPlatform, template: ContentTemplate): string {
    const benefit = 'save hours every week';
    const description = 'What used to take hours now takes seconds. Built for teams that value their time.';
    const link = 'https://flowstack.io/feature?utm_source=social&utm_medium=organic';

    return template.template
      .replace(/{{feature_name}}/g, feature)
      .replace(/{{one_line_benefit}}/g, benefit)
      .replace(/{{description}}/g, description)
      .replace(/{{link}}/g, link);
  }

  private renderCaseStudy(topic: string, _platform: SocialPlatform): string {
    return `Acme Corp was spending 20 hours/week on ${topic}.\n\nIn 30 days using FlowStack, they:\n- Cut processing time by 70%\n- Reduced errors by 85%\n- Freed up 2 team members\n\nHere's exactly how: [link]\n\nWhat metric would move the needle for your team?`;
  }

  private renderProductTip(feature: string, _platform: SocialPlatform): string {
    return `Most people don't know this about ${feature}:\n\nYou can automate the entire workflow with one click.\n\n1. Open ${feature}\n2. Click the lightning bolt icon\n3. Set your triggers\n4. Done\n\nTry it: [link]`;
  }

  private renderLimitedTimeOffer(offer: string, _platform: SocialPlatform): string {
    return `${offer} ends Friday\n\nHere's what you get:\n- 3 months free\n- Priority onboarding\n- Dedicated success manager\n\nLock it in: [link]\n\nRT to save a founder some money`;
  }

  private renderPollPost(_platform: SocialPlatform, template: ContentTemplate): string {
    const question = "What's your biggest productivity killer?";
    const options = '1. Notifications\n2. Meetings\n3. Context switching\n4. Email';

    return template.template
      .replace(/{{question}}/g, question)
      .replace(/{{options}}/g, options);
  }

  private renderQuestionPost(_platform: SocialPlatform, template: ContentTemplate): string {
    const question = "What's the best piece of career advice you've ever received?";
    const opinion = "'Focus on being valuable, not busy.' It changed how I prioritize everything.";

    return template.template
      .replace(/{{question}}/g, question)
      .replace(/{{opinion}}/g, opinion);
  }

  private renderFillInBlankPost(_platform: SocialPlatform): string {
    return `The one tool I can't live without is ___________.\n\nI'll start: FlowStack because it automates my weekly reports.\n\nYour turn. Drop yours below.`;
  }

  private renderBehindTheScenesPost(_platform: SocialPlatform, template: ContentTemplate): string {
    return template.template
      .replace(/{{feature}}/g, 'Smart Reports')
      .replace(/{{story}}/g, '3 months of iteration, 12 prototypes, and one breakthrough moment when everything clicked.')
      .replace(/{{emoji}}/g, '📊');
  }

  private renderTrendPost(_platform: SocialPlatform): string {
    return `Trending: "What's in your toolkit?"\n\nHere's what's in a product manager's toolkit:\n\n1. Notion for docs\n2. Figma for wireframes\n3. FlowStack for automation\n4. Loom for async updates\n5. Linear for tasks\n\nWhat did we miss?`;
  }

  private generateUserGeneratedPost(topic: string, platform: SocialPlatform, campaignId?: string): SocialPost {
    const now = new Date().toISOString();
    const content = `Shoutout to our amazing community!\n\n"${topic}" - shared by one of our users.\n\nThis is exactly why we do what we do.\n\nWant to be featured? Tag us in your posts!`;

    const post: SocialPost = {
      id: this.generateId('post'),
      content: this.adaptForPlatform(content, platform),
      platform,
      type: 'user_generated',
      status: 'draft',
      campaignId,
      hashtags: this.selectHashtags(platform, 'user_generated', topic),
      authorId: 'social-agent',
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(post.id, post);
    return post;
  }

  private generateCompanyCulturePost(topic: string, platform: SocialPlatform, campaignId?: string): SocialPost {
    const now = new Date().toISOString();
    const content = `Behind the scenes at FlowStack:\n\n${topic}\n\nOur team is what makes this company special. Here's a glimpse into what we're building together.\n\nWant to join us? We're hiring! Check the link in bio.`;

    const post: SocialPost = {
      id: this.generateId('post'),
      content: this.adaptForPlatform(content, platform),
      platform,
      type: 'company_culture',
      status: 'draft',
      campaignId,
      hashtags: this.selectHashtags(platform, 'company_culture', topic),
      authorId: 'social-agent',
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(post.id, post);
    return post;
  }

  // ── Helper Methods ──

  /** Find matching templates by content type, sub-type and platform */
  private findTemplates(
    contentType: ContentType,
    subType: string,
    platform: SocialPlatform
  ): ContentTemplate[] {
    const matches: ContentTemplate[] = [];
    for (const [, template] of this.templates) {
      if (
        template.contentType === contentType &&
        template.subType === subType &&
        template.platform === platform
      ) {
        matches.push(template);
      }
    }
    return matches;
  }

  /** Get a fallback template for any platform */
  private getFallbackTemplate(platform: SocialPlatform): ContentTemplate {
    return {
      id: `fallback_${platform}`,
      name: 'Fallback Template',
      contentType: 'educational',
      platform,
      template: '{{content}}',
      example: 'Fallback content',
      variables: ['content'],
      maxLength: this.platformConfigs[platform].maxCharacters,
      requiresApproval: false,
    };
  }

  /** Select hashtags for a given platform and content context */
  private selectHashtags(platform: SocialPlatform, _contentType: string, _topic: string): string[] {
    const config = this.platformConfigs[platform];
    const hashtags: string[] = [];

    if (this.hashtagStrategy.branded.length > 0) {
      hashtags.push(this.hashtagStrategy.branded[0]);
    }
    if (this.hashtagStrategy.industry.length > 0) {
      hashtags.push(this.hashtagStrategy.industry[0]);
      if (this.hashtagStrategy.industry.length > 1) {
        hashtags.push(this.hashtagStrategy.industry[1]);
      }
    }
    if (this.hashtagStrategy.topic.length > 0) {
      hashtags.push(this.hashtagStrategy.topic[0]);
    }

    return hashtags.slice(0, config.maxHashtags);
  }

  /** Calculate confidence score based on content quality and issues */
  private calculateConfidenceScore(content: string, issues: ScreeningIssue[]): number {
    let score = 80;

    if (content.includes('?')) score += 5;
    if (content.includes('1.') || content.includes('2.')) score += 5;
    if (content.length > 50 && content.length < 200) score += 5;

    for (const issue of issues) {
      if (issue.severity === 'error') score -= 20;
      else if (issue.severity === 'warning') score -= 10;
      else score -= 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /** Generate a unique ID */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /** Get platform configuration */
  getPlatformConfig(platform: SocialPlatform): PlatformConfig {
    return this.platformConfigs[platform];
  }

  /** Get all registered templates */
  getAllTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values());
  }

  /** Get a stored post by ID */
  getPost(id: string): SocialPost | undefined {
    return this.posts.get(id);
  }

  /** Get all stored posts */
  getAllPosts(): SocialPost[] {
    return Array.from(this.posts.values());
  }
}
