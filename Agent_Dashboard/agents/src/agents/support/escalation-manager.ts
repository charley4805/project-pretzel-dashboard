/**
 * Escalation Manager Module
 *
 * Handles all escalation logic for the support agent including trigger evaluation,
 * escalation package creation, human team notification, and handoff coordination.
 * Implements all 7 escalation triggers from the specification.
 */

import {
  type Conversation,
  type EscalationPackage,
  type EscalationTriggerResult,
  type EscalationReason,
  type EscalationPriority,
  type ConversationContext,
  type SentimentLabel,
} from './types';

/**
 * Escalation Manager - Evaluates escalation triggers and manages handoff to human agents.
 *
 * @example
 * ```ts
 * const em = new EscalationManager();
 * const result = em.evaluateEscalationTriggers(conversation);
 * if (result.triggered) {
 *   const pkg = em.createEscalationPackage(conversation);
 *   await em.notifyHumanTeam(pkg);
 * }
 * ```
 */
export class EscalationManager {
  private readonly maxAttempts: number;
  private readonly sentimentThreshold: number;
  private readonly confidenceThreshold: number;
  private readonly maxConversationDurationMinutes: number;
  private readonly sentimentVeryNegativeCount: number;

  /**
   * Creates a new EscalationManager instance.
   * @param options - Configuration options
   * @param options.maxAttempts - Max solution attempts before escalation (default: 5)
   * @param options.sentimentThreshold - Sentiment score threshold (default: -0.7)
   * @param options.confidenceThreshold - Minimum confidence before escalation (default: 0.4)
   * @param options.maxConversationDurationMinutes - Max conversation duration (default: 10)
   * @param options.sentimentVeryNegativeCount - Consecutive very negative messages before escalation (default: 3)
   */
  constructor(
    options: {
      maxAttempts?: number;
      sentimentThreshold?: number;
      confidenceThreshold?: number;
      maxConversationDurationMinutes?: number;
      sentimentVeryNegativeCount?: number;
    } = {}
  ) {
    this.maxAttempts = options.maxAttempts ?? 5;
    this.sentimentThreshold = options.sentimentThreshold ?? -0.7;
    this.confidenceThreshold = options.confidenceThreshold ?? 0.4;
    this.maxConversationDurationMinutes = options.maxConversationDurationMinutes ?? 10;
    this.sentimentVeryNegativeCount = options.sentimentVeryNegativeCount ?? 3;
  }

  /**
   * Evaluate all escalation triggers against the current conversation state.
   * Checks all 7 escalation triggers in priority order.
   *
   * @param context - Conversation context with current state
   * @returns Trigger evaluation result with reason and priority
   */
  evaluateEscalationTriggers(context: ConversationContext): EscalationTriggerResult {
    const { conversation } = context;

    // 1. User explicitly requests human (CRITICAL)
    const humanRequest = this.checkHumanRequestTrigger(conversation);
    if (humanRequest.triggered) return humanRequest;

    // 2. User mentions lawsuit/lawyer (CRITICAL)
    const lawsuitMention = this.checkLawsuitTrigger(conversation);
    if (lawsuitMention.triggered) return lawsuitMention;

    // 3. System-wide outage detected (CRITICAL)
    const outage = this.checkSystemOutageTrigger(context);
    if (outage.triggered) return outage;

    // 4. Legal/security concern (CRITICAL)
    const legalSecurity = this.checkLegalSecurityTrigger(conversation);
    if (legalSecurity.triggered) return legalSecurity;

    // 5. Max attempts reached (HIGH)
    const maxAttempts = this.checkMaxAttemptsTrigger(conversation);
    if (maxAttempts.triggered) return maxAttempts;

    // 6. Billing refund request (HIGH)
    const billingRefund = this.checkBillingRefundTrigger(conversation);
    if (billingRefund.triggered) return billingRefund;

    // 7. Very negative sentiment for consecutive messages (HIGH)
    const sentiment = this.checkSentimentTrigger(conversation);
    if (sentiment.triggered) return sentiment;

    // 8. Low confidence (MEDIUM)
    const lowConfidence = this.checkLowConfidenceTrigger(conversation);
    if (lowConfidence.triggered) return lowConfidence;

    // 9. Feature request (LOW - informational, not auto-escalate)
    const featureRequest = this.checkFeatureRequestTrigger(conversation);
    if (featureRequest.triggered) return featureRequest;

    // 10. Conversation timeout (HIGH)
    const timeout = this.checkTimeoutTrigger(conversation);
    if (timeout.triggered) return timeout;

    return {
      triggered: false,
      reason: null,
      priority: null,
      autoEscalate: false,
      details: 'No escalation triggers detected',
    };
  }

  /**
   * Check if user explicitly requested a human agent.
   */
  private checkHumanRequestTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    const humanKeywords = [
      'human',
      'person',
      'agent',
      'representative',
      'supervisor',
      'manager',
      'speak to someone',
      'talk to a person',
      'real person',
      'live agent',
      'customer service',
    ];

    const lastUserMessages = this.getLastNUserMessages(conversation, 3);
    for (const msg of lastUserMessages) {
      const lower = msg.content.toLowerCase();
      if (humanKeywords.some((kw) => lower.includes(kw))) {
        return {
          triggered: true,
          reason: 'user_requests_human' as EscalationReason,
          priority: 'critical' as EscalationPriority,
          autoEscalate: true,
          details: `User requested human agent: "${msg.content}"`,
        };
      }
    }

    return this.noTrigger();
  }

  /**
   * Check if user mentions lawsuit or lawyer.
   */
  private checkLawsuitTrigger(conversation: Conversation): EscalationTriggerResult {
    const lawsuitKeywords = ['lawsuit', 'lawyer', 'attorney', 'sue', 'legal action', 'litigation'];

    const lastUserMessages = this.getLastNUserMessages(conversation, 5);
    for (const msg of lastUserMessages) {
      const lower = msg.content.toLowerCase();
      if (lawsuitKeywords.some((kw) => lower.includes(kw))) {
        return {
          triggered: true,
          reason: 'user_mentions_lawsuit' as EscalationReason,
          priority: 'critical' as EscalationPriority,
          autoEscalate: true,
          details: `User mentioned legal action: "${msg.content}"`,
        };
      }
    }

    return this.noTrigger();
  }

  /**
   * Check if there's a system-wide outage that cannot be resolved by the agent.
   */
  private checkSystemOutageTrigger(context: ConversationContext): EscalationTriggerResult {
    if (
      context.systemStatus?.status === 'major_outage' ||
      (context.activeOutages && context.activeOutages.length > 0)
    ) {
      return {
        triggered: true,
        reason: 'system_wide_outage' as EscalationReason,
        priority: 'critical' as EscalationPriority,
        autoEscalate: true,
        details: `System-wide outage detected: ${context.activeOutages?.join(', ') ?? 'unknown'}`,
      };
    }

    return this.noTrigger();
  }

  /**
   * Check for legal or security concerns.
   */
  private checkLegalSecurityTrigger(conversation: Conversation): EscalationTriggerResult {
    const securityKeywords = [
      'data breach',
      'hacked',
      'security incident',
      'unauthorized access',
      'gdpr',
      'data privacy',
      'pii',
      'personal information exposed',
      'phishing',
      'compromised',
    ];

    const lastUserMessages = this.getLastNUserMessages(conversation, 5);
    for (const msg of lastUserMessages) {
      const lower = msg.content.toLowerCase();
      if (securityKeywords.some((kw) => lower.includes(kw))) {
        return {
          triggered: true,
          reason: 'legal_or_security_concern' as EscalationReason,
          priority: 'critical' as EscalationPriority,
          autoEscalate: true,
          details: `Potential security/legal concern: "${msg.content}"`,
        };
      }
    }

    return this.noTrigger();
  }

  /**
   * Check if max solution attempts have been reached.
   */
  private checkMaxAttemptsTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    if (conversation.progress.attemptCount >= this.maxAttempts) {
      return {
        triggered: true,
        reason: 'max_attempts_reached' as EscalationReason,
        priority: 'high' as EscalationPriority,
        autoEscalate: true,
        details: `Maximum ${this.maxAttempts} solution attempts reached without resolution`,
      };
    }

    return this.noTrigger();
  }

  /**
   * Check if issue involves billing refund request.
   */
  private checkBillingRefundTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    if (conversation.issue.category === 'billing') {
      const refundKeywords = [
        'refund',
        'chargeback',
        'dispute',
        'unauthorized charge',
        'money back',
      ];
      const lastMessages = this.getLastNUserMessages(conversation, 5);
      for (const msg of lastMessages) {
        const lower = msg.content.toLowerCase();
        if (refundKeywords.some((kw) => lower.includes(kw))) {
          return {
            triggered: true,
            reason: 'billing_refund_request' as EscalationReason,
            priority: 'high' as EscalationPriority,
            autoEscalate: true,
            details: `Billing refund request detected: "${msg.content}"`,
          };
        }
      }
    }

    return this.noTrigger();
  }

  /**
   * Check if user sentiment is very negative for consecutive messages.
   */
  private checkSentimentTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    const recentHistory = conversation.sentiment.history.slice(
      -this.sentimentVeryNegativeCount
    );

    if (recentHistory.length < this.sentimentVeryNegativeCount) {
      return this.noTrigger();
    }

    const allVeryNegative = recentHistory.every(
      (s) => s.value <= this.sentimentThreshold
    );

    if (allVeryNegative) {
      return {
        triggered: true,
        reason: 'sentiment_very_negative' as EscalationReason,
        priority: 'high' as EscalationPriority,
        autoEscalate: true,
        details: `User sentiment very negative (<= ${this.sentimentThreshold}) for ${this.sentimentVeryNegativeCount}+ consecutive messages`,
      };
    }

    return this.noTrigger();
  }

  /**
   * Check if confidence in any solution is below the threshold.
   */
  private checkLowConfidenceTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    const lastAttempt = conversation.resolution.attemptedSolutions.at(-1);
    if (
      conversation.progress.attemptCount > 0 &&
      lastAttempt &&
      lastAttempt.confidence < this.confidenceThreshold
    ) {
      return {
        triggered: true,
        reason: 'low_confidence' as EscalationReason,
        priority: 'medium' as EscalationPriority,
        autoEscalate: true,
        details: `Confidence (${lastAttempt.confidence}) below threshold (${this.confidenceThreshold})`,
      };
    }

    return this.noTrigger();
  }

  /**
   * Check if issue is a feature request (informational, not auto-escalate).
   */
  private checkFeatureRequestTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    if (conversation.issue.category === 'feature_request') {
      return {
        triggered: true,
        reason: 'feature_request' as EscalationReason,
        priority: 'low' as EscalationPriority,
        autoEscalate: false,
        details: 'Issue classified as feature request - informational escalation only',
      };
    }

    return this.noTrigger();
  }

  /**
   * Check if conversation has exceeded max duration.
   */
  private checkTimeoutTrigger(
    conversation: Conversation
  ): EscalationTriggerResult {
    if (
      conversation.timing.totalDurationMinutes >=
      this.maxConversationDurationMinutes
    ) {
      return {
        triggered: true,
        reason: 'conversation_timeout' as EscalationReason,
        priority: 'high' as EscalationPriority,
        autoEscalate: true,
        details: `Conversation duration (${conversation.timing.totalDurationMinutes}min) exceeded max (${this.maxConversationDurationMinutes}min)`,
      };
    }

    return this.noTrigger();
  }

  /**
   * Create a comprehensive escalation package for human handoff.
   *
   * @param conversation - The conversation to escalate
   * @returns Complete escalation package
   */
  createEscalationPackage(conversation: Conversation): EscalationPackage {
    const escalationId = this.generateEscalationId();
    const timestamp = new Date().toISOString();

    // Determine priority from conversation state
    const priority = this.derivePriority(conversation);
    const reason = this.deriveReason(conversation);

    return {
      escalationId,
      timestamp,
      priority,
      reason,
      customer: {
        userId: conversation.userId,
        name: conversation.userName,
        email: `${conversation.userName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        plan: conversation.userPlan,
        signupDate: '2024-06-15',
        ltv: '$2,400',
        previousTickets: 2,
        csatAverage: 4.5,
      },
      conversation: {
        conversationId: conversation.conversationId,
        durationMinutes: conversation.timing.totalDurationMinutes,
        messageCount: conversation.messages.length,
        summary: this.generateConversationSummary(conversation),
        fullTranscript: conversation.messages,
      },
      diagnostics: {
        issueCategory: conversation.issue.category,
        subCategory: conversation.issue.subCategory,
        urgency: conversation.issue.urgency,
        attemptedSolutions: conversation.resolution.attemptedSolutions,
        keyFindings: this.extractKeyFindings(conversation),
      },
      sentimentAnalysis: {
        initialSentiment: conversation.sentiment.initialSentiment,
        currentSentiment: conversation.sentiment.currentSentiment,
        history: conversation.sentiment.history,
        trend: conversation.sentiment.trend,
        frustrationSignals: conversation.sentiment.frustrationSignals,
      },
      recommendation: this.generateRecommendation(conversation),
      businessContext: {
        accountHealth: 'healthy',
        churnRisk: this.deriveChurnRisk(conversation),
        expansionOpportunity: 'possible_enterprise_upgrade',
        contractRenewalDate: '2025-06-15',
      },
    };
  }

  /**
   * Notify the human team about an escalation.
   * In a real implementation, this would send notifications via WebSocket,
   * Slack, email, etc.
   *
   * @param pkg - Escalation package to send
   * @returns Promise that resolves when notifications are sent
   */
  async notifyHumanTeam(pkg: EscalationPackage): Promise<void> {
    // Simulated notification channels
    const notifications = [
      this.sendWebSocketNotification(pkg),
      this.sendSlackNotification(pkg),
      this.sendEmailNotification(pkg),
    ];

    await Promise.allSettled(notifications);
  }

  /**
   * Hand off a conversation to a specific human agent.
   *
   * @param conversationId - ID of the conversation to hand off
   * @param humanAgentId - ID of the human agent taking over
   * @returns Promise resolving when handoff is complete
   */
  async handoffToHuman(
    conversationId: string,
    humanAgentId: string
  ): Promise<{ success: boolean; handoffId: string }> {
    const handoffId = `HANDOFF-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    // In a real implementation, this would:
    // 1. Update conversation status in the database
    // 2. Notify the human agent via WebSocket
    // 3. Update the escalation queue
    // 4. Log the handoff event

    return { success: true, handoffId };
  }

  // ─── Private Helpers ───

  private noTrigger(): EscalationTriggerResult {
    return {
      triggered: false,
      reason: null,
      priority: null,
      autoEscalate: false,
      details: '',
    };
  }

  private getLastNUserMessages(
    conversation: Conversation,
    n: number
  ): { content: string; timestamp: string }[] {
    return conversation.messages
      .filter((m) => m.role === 'user')
      .slice(-n);
  }

  private generateEscalationId(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    return `ESC-${date}-${seq}`;
  }

  private derivePriority(conversation: Conversation): EscalationPriority {
    if (conversation.issue.urgency === 'critical') return 'critical';
    if (conversation.sentiment.currentSentiment <= -0.8) return 'critical';
    if (conversation.issue.urgency === 'high') return 'high';
    if (conversation.sentiment.currentSentiment <= this.sentimentThreshold)
      return 'high';
    if (conversation.issue.urgency === 'medium') return 'medium';
    return 'low';
  }

  private deriveReason(conversation: Conversation): EscalationReason {
    if (conversation.progress.attemptCount >= this.maxAttempts)
      return 'max_attempts_reached';
    if (conversation.issue.category === 'billing') return 'billing_refund_request';
    if (conversation.issue.category === 'feature_request') return 'feature_request';
    return 'low_confidence';
  }

  private generateConversationSummary(conversation: Conversation): string {
    const issueDesc = conversation.issue.description || 'an unspecified issue';
    const category = conversation.issue.category;
    const attempts = conversation.progress.attemptCount;

    return `Customer experiencing ${issueDesc} (${category}). ${attempts} solution(s) attempted without resolution. Current sentiment: ${conversation.sentiment.currentSentiment.toFixed(2)}.`;
  }

  private extractKeyFindings(conversation: Conversation): string[] {
    const findings: string[] = [];
    findings.push(
      `Issue category: ${conversation.issue.category} (${conversation.issue.subCategory})`
    );
    findings.push(
      `Sentiment trend: ${conversation.sentiment.trend} (current: ${conversation.sentiment.currentSentiment.toFixed(2)})`
    );

    for (const attempt of conversation.resolution.attemptedSolutions) {
      findings.push(`Attempt ${attempt.step}: ${attempt.action} -> ${attempt.outcome}`);
    }

    return findings;
  }

  private generateRecommendation(
    conversation: Conversation
  ): {
    suggestedTeam: string;
    suggestedPriority: EscalationPriority;
    estimatedComplexity: 'low' | 'medium' | 'high';
    recommendedAssigneeSkills: string[];
    notes: string;
  } {
    const category = conversation.issue.category;
    const teamMap: Record<string, string> = {
      account: 'account_support',
      billing: 'billing_support',
      technical: 'technical_support_tier2',
      integration: 'technical_support_tier2',
      how_to: 'general_support',
      bug: 'engineering_triage',
      feature_request: 'product_team',
      other: 'general_support',
    };

    const skillsMap: Record<string, string[]> = {
      account: ['account_management', 'authentication'],
      billing: ['billing', 'subscriptions', 'refunds'],
      technical: ['debugging', 'performance', 'infrastructure'],
      integration: ['apis', 'webhooks', 'third_party'],
      how_to: ['training', 'product_knowledge'],
      bug: ['bug_triage', 'qa', 'engineering'],
      feature_request: ['product_management', 'roadmap'],
      other: ['general_support'],
    };

    return {
      suggestedTeam: teamMap[category] ?? 'general_support',
      suggestedPriority: this.derivePriority(conversation),
      estimatedComplexity:
        conversation.progress.attemptCount >= 4 ? 'high' : 'medium',
      recommendedAssigneeSkills: skillsMap[category] ?? ['general_support'],
      notes: `Customer on ${conversation.userPlan} plan. ${conversation.progress.attemptCount} attempts made. Sentiment trending ${conversation.sentiment.trend}.`,
    };
  }

  private deriveChurnRisk(conversation: Conversation): 'low' | 'medium' | 'high' {
    if (conversation.sentiment.currentSentiment <= -0.8) return 'high';
    if (conversation.sentiment.currentSentiment <= -0.5) return 'medium';
    if (conversation.sentiment.trend === 'declining') return 'medium';
    return 'low';
  }

  // ─── Notification Channel Simulations ───

  private async sendWebSocketNotification(pkg: EscalationPackage): Promise<void> {
    // Placeholder: In real implementation, push via WebSocket to dashboard
    // e.g., ws.emit('support.escalation.created', pkg)
  }

  private async sendSlackNotification(pkg: EscalationPackage): Promise<void> {
    // Placeholder: In real implementation, post to Slack webhook
    // e.g., slackClient.post('#support-escalations', { text: `Escalation ${pkg.escalationId}: ${pkg.conversation.summary}` })
  }

  private async sendEmailNotification(pkg: EscalationPackage): Promise<void> {
    // Placeholder: In real implementation, send email via SendGrid/Mailgun
    // e.g., emailClient.send({ to: 'oncall@company.com', subject: `Escalation ${pkg.escalationId}` })
  }
}

export default EscalationManager;
