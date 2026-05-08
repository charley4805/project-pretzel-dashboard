/**
 * Engagement Manager - Social Media Agent
 * Handles audience interactions, response decisions, and reply generation
 * across all social platforms following the engagement decision matrix.
 */

import {
  type EngagementInteraction,
  type InteractionType,
  type ActionType,
  type SocialUser,
} from './types';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

/** Toxicity threshold for hiding comments */
const TOXICITY_HIDE_THRESHOLD = 0.7;

/** Borderline toxicity threshold for flagging */
const TOXICITY_FLAG_THRESHOLD = 0.4;

/** Default response time targets in minutes by interaction type */
const RESPONSE_TIME_TARGETS: Record<InteractionType, number> = {
  comment_positive: 240,
  comment_question: 120,
  comment_complaint: 30,
  comment_spam: 0,
  comment_competitor_mention: 0,
  mention_positive: 60,
  mention_question: 120,
  mention_complaint: 30,
  mention_comparison: 120,
  dm_sales_inquiry: 60,
  dm_support_request: 30,
  dm_partnership: 120,
  dm_spam: 0,
  share_retweet: 240,
  share_industry: 240,
};

// ──────────────────────────────────────────────
// Engagement Manager Class
// ──────────────────────────────────────────────

/**
 * EngagementManager processes audience interactions and decides
 * appropriate responses following the engagement decision matrix.
 */
export class EngagementManager {
  private interactions: Map<string, EngagementInteraction>;
  private responseTemplates: Map<string, string[]>;
  private replyHistory: Map<string, string[]>;

  constructor() {
    this.interactions = new Map();
    this.responseTemplates = new Map();
    this.replyHistory = new Map();
    this.initializeTemplates();
  }

  /** Initialize response templates for common interaction types */
  private initializeTemplates(): void {
    // Positive comment responses
    this.responseTemplates.set('comment_positive', [
      'Thanks {{name}}! So glad it\'s helping. What workflow has it improved most for you?',
      'This made our day, {{name}}! If you ever want to share your story, we\'d love to feature it. DM us!',
      'Yes! That\'s exactly why we built it. Pro tip: try combining it with {{related_feature}} for even more power.',
      'Appreciate you, {{name}}! 🙌 What feature should we build next?',
    ]);

    // Question comment responses
    this.responseTemplates.set('comment_question', [
      'Great question, {{name}}! We focus on {{differentiator}}, which means {{benefit}}. Happy to walk you through it - feel free to DM us.',
      'Awesome question! {{answer}}. Want a deeper dive? Check out {{resource_link}}.',
      'Hey {{name}}, thanks for asking! {{answer}}. Let me know if you want me to elaborate!',
    ]);

    // Complaint comment responses
    this.responseTemplates.set('comment_complaint', [
      'Sorry to hear that, {{name}} - that\'s not the experience we want. Let\'s get this fixed. Can you DM us your details? Our team will jump on it.',
      'We hear you, {{name}}, and we\'re on it. Please DM us so we can make this right.',
      'That\'s frustrating, {{name}} - we get it. DM us and we\'ll prioritize a fix for you.',
    ]);

    // Positive mention responses
    this.responseTemplates.set('mention_positive', [
      '{{name}} Thanks for the shoutout! Made our day. 💙',
      'So glad you\'re loving FlowStack, {{name}}! Keep building amazing things!',
      'This is why we do what we do. Thanks for sharing, {{name}}!',
    ]);

    // Neutral mention responses
    this.responseTemplates.set('mention_question', [
      '{{name}} Hey! Happy to answer any questions. What would you like to know? Or check out {{link}} for details.',
      'Hi {{name}}! We\'d love to help. What can we tell you about FlowStack?',
    ]);

    // Negative mention responses
    this.responseTemplates.set('mention_complaint', [
      '{{name}} Sorry to hear you\'re having trouble. We want to make this right. Can you DM us so we can help?',
      'We\'re sorry for the frustration, {{name}}. DM us and we\'ll get this sorted ASAP.',
    ]);

    // Comparison responses
    this.responseTemplates.set('mention_comparison', [
      'Great question! We focus on {{differentiator_1}} and {{differentiator_2}}, which means {{benefit}}. Happy to show you a comparison - DM us.',
      'Thanks for comparing! Our strength is {{differentiator}}. Want a personalized walkthrough?',
    ]);

    // DM sales inquiry responses
    this.responseTemplates.set('dm_sales_inquiry', [
      'Hey {{name}}! Thanks for reaching out. Based on what you shared, {{plan}} sounds like the right fit. Here\'s why: {{reasons}}. Want to chat? Book a call: {{link}}',
    ]);

    // DM support request responses
    this.responseTemplates.set('dm_support_request', [
      'Hey {{name}}! I\'ll connect you with our support team. They\'ll be with you shortly at {{support_link}}. Reference this conversation!',
    ]);

    // DM partnership responses
    this.responseTemplates.set('dm_partnership', [
      'Hi {{name}}! Partnerships are exciting. Can you share more about what you have in mind? Our partnerships team will follow up.',
    ]);

    // Share/retweet thank you responses
    this.responseTemplates.set('share_retweet', [
      'Thanks for sharing, {{name}}! 🙏',
      'We appreciate the share, {{name}}! Glad you found it valuable.',
    ]);

    // Industry share responses
    this.responseTemplates.set('share_industry', [
      'Great share! Thanks for amplifying this, {{name}}.',
    ]);
  }

  // ── Public Methods ──

  /**
   * Process a new interaction from the audience.
   * This is the main entry point for handling engagement.
   * @param interaction - The engagement interaction to process
   * @returns The processed interaction with action taken and reply content
   */
  processInteraction(interaction: EngagementInteraction): EngagementInteraction {
    // Store interaction
    this.interactions.set(interaction.id, interaction);

    // Check toxicity first
    if (interaction.toxicityScore !== undefined && interaction.toxicityScore > TOXICITY_HIDE_THRESHOLD) {
      const processed: EngagementInteraction = {
        ...interaction,
        actionTaken: 'hide',
        resolved: true,
        resolvedAt: new Date().toISOString(),
      };
      this.interactions.set(processed.id, processed);
      return processed;
    }

    // Decide action based on interaction type
    const action = this.decideResponseAction(interaction);

    // Generate reply if needed
    let replyContent: string | undefined;
    if (action === 'reply' || action === 'like_and_reply' || action === 'reply_and_dm') {
      replyContent = this.generateReply(interaction);
    }

    // Calculate response time
    const now = new Date();
    const createdAt = new Date(interaction.createdAt);
    const responseTimeMinutes = Math.round((now.getTime() - createdAt.getTime()) / 60000);

    const processed: EngagementInteraction = {
      ...interaction,
      actionTaken: action,
      replyContent,
      resolved: action !== 'flag_for_review',
      responseTimeMinutes,
      resolvedAt: action !== 'flag_for_review' ? now.toISOString() : undefined,
    };

    this.interactions.set(processed.id, processed);

    // Track in reply history
    if (replyContent) {
      const history = this.replyHistory.get(interaction.user.id) ?? [];
      history.push(replyContent);
      this.replyHistory.set(interaction.user.id, history);
    }

    return processed;
  }

  /**
   * Decide the appropriate action for an interaction based on the engagement matrix.
   * @param interaction - The engagement interaction to evaluate
   * @returns The recommended action type
   */
  decideResponseAction(interaction: EngagementInteraction): ActionType {
    const { type, /* sentimentScore */ toxicityScore, user } = interaction;

    // Check toxicity levels
    if (toxicityScore !== undefined) {
      if (toxicityScore > TOXICITY_HIDE_THRESHOLD) {
        return 'hide';
      }
      if (toxicityScore > TOXICITY_FLAG_THRESHOLD) {
        return 'flag_for_review';
      }
    }

    // Route by interaction type using the decision matrix
    switch (type) {
      // Comments on our posts
      case 'comment_positive':
        return 'like_and_reply';

      case 'comment_question':
        return 'reply';

      case 'comment_complaint':
        return 'reply_and_dm';

      case 'comment_spam':
        return user.isInfluencer ? 'flag_for_review' : 'hide';

      case 'comment_competitor_mention':
        return 'ignore';

      // Brand mentions
      case 'mention_positive':
        return 'like_and_share';

      case 'mention_question':
        return 'reply';

      case 'mention_complaint':
        return 'reply_and_dm';

      case 'mention_comparison':
        return 'reply';

      // Direct messages
      case 'dm_sales_inquiry':
        return 'route_to_sales';

      case 'dm_support_request':
        return 'route_to_support';

      case 'dm_partnership':
        return 'route_to_partnerships';

      case 'dm_spam':
        return 'ignore';

      // Shares/retweets
      case 'share_retweet':
        return user.isPartner ? 'thank' : 'like';

      case 'share_industry':
        return 'share_retweet';

      default:
        return 'ignore';
    }
  }

  /**
   * Generate a contextual reply for an interaction.
   * @param interaction - The engagement interaction to reply to
   * @returns Generated reply content
   */
  generateReply(interaction: EngagementInteraction): string {
    const { type, content, user } = interaction;
    const userName = user.displayName.split(' ')[0];

    // Select template key based on interaction type
    const templateKey = this.getTemplateKeyForInteraction(type);
    const templates = this.responseTemplates.get(templateKey) ?? [];

    if (templates.length === 0) {
      return `Thanks for reaching out, ${userName}! We'll get back to you soon.`;
    }

    // Select template (round-robin to avoid repetition)
    const history = this.replyHistory.get(user.id) ?? [];
    let template = templates[0];
    for (const t of templates) {
      if (!history.includes(t)) {
        template = t;
        break;
      }
    }

    // Fill in template variables
    let reply = template
      .replace(/{{name}}/g, userName)
      .replace(/{{differentiator}}/g, 'automation and simplicity')
      .replace(/{{differentiator_1}}/g, 'ease of use')
      .replace(/{{differentiator_2}}/g, 'powerful integrations')
      .replace(/{{benefit}}/g, 'you get set up in minutes, not weeks')
      .replace(/{{answer}}/g, this.generateAnswerForQuestion(content))
      .replace(/{{related_feature}}/g, 'Smart Reports')
      .replace(/{{resource_link}}/g, 'https://docs.flowstack.io')
      .replace(/{{plan}}/g, 'Pro')
      .replace(/{{reasons}}/g, 'unlimited automations, priority support, and advanced analytics')
      .replace(/{{link}}/g, 'https://flowstack.io/demo')
      .replace(/{{support_link}}/g, 'https://support.flowstack.io')
      .replace(/{{feature}}/g, this.extractFeatureFromContent(content));

    // Add DM prompt for complaints
    if (type === 'comment_complaint' || type === 'mention_complaint') {
      reply += ' DM us your account email and we\'ll prioritize this.';
    }

    return reply;
  }

  /**
   * Determine whether to like an interaction based on type and rules.
   * @param interaction - The engagement interaction
   * @returns True if the interaction should be liked
   */
  shouldLike(interaction: EngagementInteraction): boolean {
    const likeTypes: InteractionType[] = [
      'comment_positive',
      'mention_positive',
      'share_retweet',
      'share_industry',
    ];

    // Never like complaints
    if (interaction.type.includes('complaint')) return false;

    // Never like spam
    if (interaction.type.includes('spam')) return false;

    return likeTypes.includes(interaction.type);
  }

  /**
   * Determine whether to share/retweet an interaction.
   * @param interaction - The engagement interaction
   * @returns True if the interaction should be shared
   */
  shouldShare(interaction: EngagementInteraction): boolean {
    const shareTypes: InteractionType[] = [
      'mention_positive',
      'share_retweet',
      'share_industry',
    ];

    // Only share from verified partners or positive mentions
    if (interaction.type === 'mention_positive' && interaction.user.isPartner) {
      return true;
    }

    return shareTypes.includes(interaction.type);
  }

  /**
   * Determine whether to ignore an interaction.
   * @param interaction - The engagement interaction
   * @returns True if the interaction should be ignored
   */
  shouldIgnore(interaction: EngagementInteraction): boolean {
    const ignoreTypes: InteractionType[] = [
      'comment_competitor_mention',
      'comment_spam',
      'dm_spam',
    ];

    return ignoreTypes.includes(interaction.type);
  }

  // ── Private Helper Methods ──

  /** Map interaction type to template key */
  private getTemplateKeyForInteraction(type: InteractionType): string {
    const mapping: Record<InteractionType, string> = {
      comment_positive: 'comment_positive',
      comment_question: 'comment_question',
      comment_complaint: 'comment_complaint',
      comment_spam: 'comment_spam',
      comment_competitor_mention: 'comment_competitor_mention',
      mention_positive: 'mention_positive',
      mention_question: 'mention_question',
      mention_complaint: 'mention_complaint',
      mention_comparison: 'mention_comparison',
      dm_sales_inquiry: 'dm_sales_inquiry',
      dm_support_request: 'dm_support_request',
      dm_partnership: 'dm_partnership',
      dm_spam: 'dm_spam',
      share_retweet: 'share_retweet',
      share_industry: 'share_industry',
    };
    return mapping[type] ?? 'comment_positive';
  }

  /** Generate a contextual answer based on question content */
  private generateAnswerForQuestion(content: string): string {
    const lower = content.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('plan')) {
      return 'We have plans starting from free up to Enterprise. You can see all pricing at flowstack.io/pricing';
    }
    if (lower.includes('integrate') || lower.includes('connect')) {
      return 'We integrate with 200+ tools including Slack, Notion, Jira, and Salesforce';
    }
    if (lower.includes('api') || lower.includes('developer')) {
      return 'Yes, we have a full REST API and webhooks. Check out our developer docs';
    }
    if (lower.includes('trial') || lower.includes('demo')) {
      return 'Absolutely! You can start a free 14-day trial with no credit card required';
    }
    if (lower.includes('vs') || lower.includes('compare')) {
      return 'Great question! Our differentiator is ease of use combined with powerful automation';
    }
    if (lower.includes('security') || lower.includes('gdpr') || lower.includes('hipaa')) {
      return 'We\'re SOC 2 Type II certified and GDPR compliant. Enterprise plans include HIPAA compliance';
    }

    return 'Great question! We\'d be happy to help. Here\'s what you need to know:';
  }

  /** Extract a feature name from user content */
  private extractFeatureFromContent(content: string): string {
    const featureMatches = content.match(/(?:feature|tool|automation|report|dashboard|integration)/i);
    return featureMatches ? featureMatches[0] : 'FlowStack';
  }

  // ── Query Methods ──

  /** Get an interaction by ID */
  getInteraction(id: string): EngagementInteraction | undefined {
    return this.interactions.get(id);
  }

  /** Get all interactions, optionally filtered by status */
  getAllInteractions(resolved?: boolean): EngagementInteraction[] {
    const all = Array.from(this.interactions.values());
    if (resolved !== undefined) {
      return all.filter((i) => i.resolved === resolved);
    }
    return all;
  }

  /** Get response time target for an interaction type */
  getResponseTimeTarget(type: InteractionType): number {
    return RESPONSE_TIME_TARGETS[type] ?? 120;
  }

  /** Get average response time for resolved interactions */
  getAverageResponseTime(): number {
    const resolved = this.getAllInteractions(true);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, i) => sum + (i.responseTimeMinutes ?? 0), 0);
    return Math.round(total / resolved.length);
  }

  /** Get engagement statistics */
  getStats(): {
    total: number;
    resolved: number;
    pending: number;
    byType: Record<string, number>;
    averageResponseTime: number;
  } {
    const all = this.getAllInteractions();
    const resolved = all.filter((i) => i.resolved);
    const pending = all.filter((i) => !i.resolved);

    const byType: Record<string, number> = {};
    for (const i of all) {
      byType[i.type] = (byType[i.type] ?? 0) + 1;
    }

    return {
      total: all.length,
      resolved: resolved.length,
      pending: pending.length,
      byType,
      averageResponseTime: this.getAverageResponseTime(),
    };
  }
}

// ──────────────────────────────────────────────
// Mock Data Generator
// ──────────────────────────────────────────────

/** Generate realistic mock interactions for testing */
export function generateMockInteractions(): EngagementInteraction[] {
  const now = new Date();
  const users: SocialUser[] = [
    { id: 'user_1', platformUserId: 'tw_101', platform: 'twitter', displayName: 'Sarah Chen', handle: '@sarahchen', followerCount: 12500, isVerified: true },
    { id: 'user_2', platformUserId: 'li_202', platform: 'linkedin', displayName: 'Marcus Johnson', handle: 'marcus-johnson', followerCount: 8500 },
    { id: 'user_3', platformUserId: 'tw_303', platform: 'twitter', displayName: 'Alex Rivera', handle: '@arivera', followerCount: 3200 },
    { id: 'user_4', platformUserId: 'in_404', platform: 'instagram', displayName: 'Product Daily', handle: '@productdaily', followerCount: 45000, isInfluencer: true },
    { id: 'user_5', platformUserId: 'li_505', platform: 'linkedin', displayName: 'Emily Zhang', handle: 'emily-zhang', followerCount: 1500 },
    { id: 'user_6', platformUserId: 'tw_606', platform: 'twitter', displayName: 'Tech Grumbler', handle: '@techgrumbler', followerCount: 200 },
    { id: 'user_7', platformUserId: 'fb_707', platform: 'facebook', displayName: 'David Park', handle: 'david.park', followerCount: 600, isPartner: true },
    { id: 'user_8', platformUserId: 'tw_808', platform: 'twitter', displayName: 'Spam Bot', handle: '@spambot9000', followerCount: 10 },
  ];

  const interactions: EngagementInteraction[] = [
    {
      id: 'int_001',
      targetPostId: 'post_001',
      type: 'comment_positive',
      platform: 'twitter',
      platformInteractionId: 'tw_comment_101',
      user: users[0],
      content: 'Love this feature! Game changer for our team.',
      sentimentScore: 0.85,
      toxicityScore: 0.0,
      resolved: false,
      createdAt: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: 'int_002',
      targetPostId: 'post_001',
      type: 'comment_question',
      platform: 'twitter',
      platformInteractionId: 'tw_comment_102',
      user: users[1],
      content: 'How does this compare to other project management tools?',
      sentimentScore: 0.1,
      toxicityScore: 0.0,
      resolved: false,
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: 'int_003',
      targetPostId: 'post_002',
      type: 'comment_complaint',
      platform: 'twitter',
      platformInteractionId: 'tw_comment_103',
      user: users[2],
      content: 'Your app keeps crashing. Super frustrating.',
      sentimentScore: -0.6,
      toxicityScore: 0.2,
      resolved: false,
      createdAt: new Date(now.getTime() - 1800000).toISOString(),
    },
    {
      id: 'int_004',
      targetPostId: undefined,
      type: 'mention_positive',
      platform: 'twitter',
      platformInteractionId: 'tw_mention_201',
      user: users[3],
      content: 'Just tried FlowStack for the first time. Mind = blown 🤯',
      sentimentScore: 0.9,
      toxicityScore: 0.0,
      resolved: false,
      createdAt: new Date(now.getTime() - 5400000).toISOString(),
    },
    {
      id: 'int_005',
      targetPostId: undefined,
      type: 'mention_question',
      platform: 'linkedin',
      platformInteractionId: 'li_mention_301',
      user: users[4],
      content: 'Has anyone used FlowStack for enterprise reporting? Looking for feedback.',
      sentimentScore: 0.1,
      toxicityScore: 0.0,
      resolved: false,
      createdAt: new Date(now.getTime() - 10800000).toISOString(),
    },
    {
      id: 'int_006',
      targetPostId: undefined,
      type: 'mention_complaint',
      platform: 'twitter',
      platformInteractionId: 'tw_mention_202',
      user: users[5],
      content: 'FlowStack billing is confusing and support never responds.',
      sentimentScore: -0.5,
      toxicityScore: 0.25,
      resolved: false,
      createdAt: new Date(now.getTime() - 900000).toISOString(),
    },
    {
      id: 'int_007',
      targetPostId: undefined,
      type: 'share_retweet',
      platform: 'twitter',
      platformInteractionId: 'tw_share_401',
      user: users[6],
      content: 'RT @flowstack: New feature drop...',
      sentimentScore: 0.6,
      toxicityScore: 0.0,
      resolved: false,
      createdAt: new Date(now.getTime() - 14400000).toISOString(),
    },
    {
      id: 'int_008',
      targetPostId: 'post_003',
      type: 'comment_spam',
      platform: 'twitter',
      platformInteractionId: 'tw_comment_104',
      user: users[7],
      content: 'Make $5000/day from home!!! Click here now!!!',
      sentimentScore: 0.0,
      toxicityScore: 0.1,
      resolved: false,
      createdAt: new Date(now.getTime() - 600000).toISOString(),
    },
    {
      id: 'int_009',
      targetPostId: undefined,
      type: 'dm_sales_inquiry',
      platform: 'linkedin',
      platformInteractionId: 'li_dm_501',
      user: users[1],
      content: 'Hi, I\'m interested in FlowStack for my team of 50. Can you share pricing?',
      sentimentScore: 0.3,
      toxicityScore: 0.0,
      resolved: false,
      createdAt: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: 'int_010',
      targetPostId: undefined,
      type: 'dm_support_request',
      platform: 'twitter',
      platformInteractionId: 'tw_dm_601',
      user: users[2],
      content: 'Hey, I can\'t export my reports. Getting a 500 error every time.',
      sentimentScore: -0.3,
      toxicityScore: 0.05,
      resolved: false,
      createdAt: new Date(now.getTime() - 1800000).toISOString(),
    },
  ];

  return interactions;
}
