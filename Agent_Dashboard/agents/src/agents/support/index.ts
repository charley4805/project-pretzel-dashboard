/**
 * Support Agent - Main Orchestrator Module
 *
 * The SupportAgent class orchestrates all support agent components:
 * - ConversationEngine for message processing
 * - KnowledgeBase for solution lookup
 * - EscalationManager for human handoff
 *
 * Provides a unified interface for handling customer support conversations
 * with full lifecycle management from greeting to resolution or escalation.
 *
 * @example
 * ```ts
 * const agent = new SupportAgent();
 * const result = await agent.processMessage({
 *   role: 'user',
 *   content: 'I forgot my password',
 *   timestamp: new Date().toISOString()
 * }, conversationContext);
 * ```
 */

import {
  type Message,
  type Conversation,
  type ConversationContext,
  type ConversationStep,
  type EscalationPackage,
  type MessageProcessingResult,
  type SupportAgentConfig,
  type UserProfile,
  type SystemStatus,
  type IssueCategory,
  type SentimentLabel,
  type SentimentTrend,
  type ResolutionStatus,
  type KnowledgeBaseArticle,
  type KnowledgeBaseSearchResult,
  type AngerDetectionResult,
  type VagueIssueDetectionResult,
} from './types';

import { SupportConversationEngine } from './conversation-engine';
import { KnowledgeBase, DEFAULT_KB_ARTICLES } from './knowledge-base';
import { EscalationManager } from './escalation-manager';

/** Default configuration for the support agent */
const DEFAULT_CONFIG: SupportAgentConfig = {
  agentName: 'Alex',
  companyName: 'AcmeFlow',
  productDescription: 'helps teams manage projects and workflows',
  escalationSla: '15 minutes',
  urgentSla: '5 minutes',
  businessHoursStart: '9:00 AM UTC',
  maxSolutionAttempts: 5,
  maxConversationDurationMinutes: 10,
  sentimentThreshold: -0.7,
  confidenceThreshold: 0.4,
  autoEscalationEnabled: true,
};

/**
 * Support Agent - Main orchestrator class.
 *
 * Coordinates conversation handling, knowledge base queries, and escalation
 * management to provide end-to-end customer support automation.
 */
export class SupportAgent {
  private config: SupportAgentConfig;
  private kb: KnowledgeBase;
  private escalationManager: EscalationManager;
  private engine: SupportConversationEngine;
  private systemStatus: SystemStatus;
  private activeOutages: string[];

  /**
   * Creates a new SupportAgent instance with all sub-components.
   *
   * @param config - Partial configuration to override defaults
   * @param initialArticles - Optional custom KB articles
   */
  constructor(
    config: Partial<SupportAgentConfig> = {},
    initialArticles?: KnowledgeBaseArticle[]
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.kb = new KnowledgeBase(initialArticles ?? DEFAULT_KB_ARTICLES);
    this.escalationManager = new EscalationManager({
      maxAttempts: this.config.maxSolutionAttempts,
      sentimentThreshold: this.config.sentimentThreshold,
      confidenceThreshold: this.config.confidenceThreshold,
      maxConversationDurationMinutes: this.config.maxConversationDurationMinutes,
    });
    this.engine = new SupportConversationEngine(this.kb, this.escalationManager, {
      maxAttempts: this.config.maxSolutionAttempts,
    });
    this.systemStatus = { status: 'operational', activeIncidents: [], lastUpdated: new Date().toISOString() };
    this.activeOutages = [];
  }

  // ─── Core Public API ───

  /**
   * Process an incoming user message and generate a response.
   * This is the primary entry point for the support agent.
   *
   * @param message - The incoming user message
   * @param conversationContext - Current conversation context
   * @returns Processing result with response and updated state
   */
  processMessage(
    message: Message,
    conversationContext: ConversationContext
  ): MessageProcessingResult {
    // Enrich context with system status
    const enrichedContext: ConversationContext = {
      ...conversationContext,
      systemStatus: conversationContext.systemStatus ?? this.systemStatus,
      activeOutages: conversationContext.activeOutages ?? this.activeOutages,
    };

    return this.engine.handleMessage(message, enrichedContext);
  }

  /**
   * Create a new conversation with initialized state.
   *
   * @param conversationId - Unique conversation ID
   * @param userId - User ID
   * @param userName - User display name
   * @param userPlan - User subscription plan
   * @returns Initialized conversation object
   */
  createConversation(
    conversationId: string,
    userId: string,
    userName: string,
    userPlan: string = 'Free'
  ): Conversation {
    const now = new Date().toISOString();

    return {
      conversationId,
      userId,
      userName,
      userPlan,
      issue: {
        category: 'other',
        subCategory: 'unknown',
        description: '',
        urgency: 'medium',
      },
      progress: {
        currentStep: 'greeting',
        attemptCount: 0,
        maxAttempts: this.config.maxSolutionAttempts,
        questionsAsked: [],
        informationGathered: {},
      },
      sentiment: {
        initialSentiment: 0,
        currentSentiment: 0,
        history: [],
        trend: 'stable',
        frustrationSignals: [],
      },
      resolution: {
        attemptedSolutions: [],
        finalStatus: 'in_progress',
        satisfactionScore: null,
      },
      timing: {
        startedAt: now,
        lastActivityAt: now,
        totalDurationMinutes: 0,
      },
      messages: [],
    };
  }

  /**
   * Classify an incoming message to determine the issue category.
   *
   * @param message - User message to classify
   * @returns Classified issue category
   */
  classifyIssue(message: Message): IssueCategory {
    const content = message.content.toLowerCase();

    const categoryPatterns: Record<IssueCategory, string[]> = {
      account: ['login', 'password', 'sign in', 'locked out', 'forgot', 'account', 'sso', 'mfa', '2fa'],
      billing: ['charged', 'invoice', 'payment', 'bill', 'refund', 'upgrade', 'downgrade', 'cancel subscription', 'pricing', 'plan'],
      technical: ['error', 'bug', 'crash', 'slow', 'loading', 'not working', 'blank', 'freeze', 'timeout', '500', '404'],
      integration: ['webhook', 'api', 'integration', 'salesforce', 'slack', 'zapier', 'sync', 'connector'],
      how_to: ['how do i', 'how to', 'where is', 'where can', 'can i', 'tutorial', 'guide', 'documentation'],
      bug: ['bug', 'defect', 'glitch', 'broken feature', 'used to work', 'regression'],
      feature_request: ['feature request', 'would be nice', 'wish it had', 'add support for', 'enhancement', 'roadmap'],
      other: [],
    };

    let bestCategory: IssueCategory = 'other';
    let bestScore = 0;

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      let score = 0;
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category as IssueCategory;
      }
    }

    return bestCategory;
  }

  /**
   * Get the next diagnostic question for the current issue category.
   *
   * @param category - Issue category
   * @param questionsAsked - Questions already asked
   * @returns Next question or null if done
   */
  getNextDiagnosticQuestion(
    category: IssueCategory,
    questionsAsked: string[]
  ): string | null {
    return this.engine.gatherInformation(category, questionsAsked);
  }

  /**
   * Check if a conversation should be escalated.
   *
   * @param context - Conversation context
   * @returns True if escalation is needed
   */
  checkEscalationNeeded(context: ConversationContext): boolean {
    return this.engine.shouldEscalate(context);
  }

  /**
   * Build an escalation package for a conversation.
   *
   * @param conversation - Conversation to escalate
   * @returns Escalation package
   */
  buildEscalationPackage(conversation: Conversation): EscalationPackage {
    return this.engine.buildEscalationPackage(conversation);
  }

  /**
   * Handle a manual escalation request (e.g., from dashboard).
   *
   * @param conversation - Conversation to escalate
   * @param reason - Escalation reason
   * @returns Processing result with escalation response
   */
  escalateManually(
    conversation: Conversation,
    reason: string
  ): MessageProcessingResult {
    conversation.progress.currentStep = 'escalating';
    conversation.resolution.finalStatus = 'escalated';

    const pkg = this.buildEscalationPackage(conversation);

    // Notify human team
    this.escalationManager.notifyHumanTeam(pkg).catch(() => {
      // Silently handle notification failure
    });

    const response = `I understand. I'm connecting you with a specialist right away. They'll be able to help you with ${reason}. You won't need to repeat anything - they'll have full context.`;

    return {
      response,
      conversation,
      escalated: true,
      escalationPackage: pkg,
      actions: ['manual_escalation', 'escalation_package_created'],
    };
  }

  /**
   * Hand off a conversation to a specific human agent.
   *
   * @param conversationId - Conversation ID
   * @param humanAgentId - Human agent ID
   * @returns Handoff result
   */
  async handoffToHuman(
    conversationId: string,
    humanAgentId: string
  ): Promise<{ success: boolean; handoffId: string }> {
    return this.escalationManager.handoffToHuman(conversationId, humanAgentId);
  }

  // ─── Sentiment & Analytics ───

  /**
   * Get current sentiment analysis for a conversation.
   *
   * @param conversation - Conversation to analyze
   * @returns Current sentiment score and trend
   */
  getSentiment(conversation: Conversation): {
    current: number;
    trend: SentimentTrend;
    label: SentimentLabel;
    history: { value: number; timestamp: string }[];
  } {
    const current = conversation.sentiment.currentSentiment;
    return {
      current,
      trend: conversation.sentiment.trend,
      label: this.scoreToLabel(current),
      history: conversation.sentiment.history,
    };
  }

  /**
   * Detect anger in a user message.
   *
   * @param message - Message to analyze
   * @param sentimentHistory - Previous sentiment scores
   * @returns Anger detection result
   */
  detectAnger(
    message: string,
    sentimentHistory: number[]
  ): AngerDetectionResult {
    return this.engine.detectAnger(message, sentimentHistory);
  }

  /**
   * Detect if a user message describes a vague issue.
   *
   * @param message - Message to analyze
   * @returns Vague issue detection result
   */
  detectVagueIssue(message: string): VagueIssueDetectionResult {
    return this.engine.detectVagueIssue(message);
  }

  /**
   * Generate a conversation summary.
   *
   * @param conversation - Conversation to summarize
   * @returns Summary string
   */
  summarizeConversation(conversation: Conversation): string {
    return this.engine.generateConversationSummary(conversation);
  }

  // ─── Knowledge Base Access ───

  /**
   * Search the knowledge base.
   *
   * @param query - Search query
   * @param category - Optional category filter
   * @returns Search results
   */
  searchKnowledgeBase(
    query: string,
    category?: IssueCategory
  ): KnowledgeBaseSearchResult[] {
    return this.kb.search(query, category);
  }

  /**
   * Get a KB article by ID.
   *
   * @param id - Article ID
   * @returns Article or undefined
   */
  getKnowledgeArticle(id: string): KnowledgeBaseArticle | undefined {
    return this.kb.getArticle(id);
  }

  /**
   * Add a new article to the knowledge base.
   *
   * @param article - Article to add
   */
  addKnowledgeArticle(article: KnowledgeBaseArticle): void {
    this.kb.addArticle(article);
  }

  /**
   * Get total KB article count.
   */
  getKnowledgeBaseSize(): number {
    return this.kb.getArticleCount();
  }

  // ─── System Status ───

  /**
   * Update the system status (e.g., when outages are detected).
   *
   * @param status - New system status
   * @param activeOutages - List of active outage descriptions
   */
  updateSystemStatus(status: SystemStatus, activeOutages: string[]): void {
    this.systemStatus = status;
    this.activeOutages = activeOutages;
  }

  // ─── Troubleshooting Decision Tree ───

  /**
   * Get the next step in the troubleshooting decision tree.
   *
   * @param currentStep - Current conversation step
   * @param result - Result of previous action
   * @param attemptCount - Current attempt count
   * @returns Next conversation step
   */
  getNextTroubleshootingStep(
    currentStep: ConversationStep,
    result: 'success' | 'failed' | 'needs_clarification' | 'unclear',
    attemptCount?: number
  ): ConversationStep {
    return this.engine.getNextStep(currentStep, result, attemptCount);
  }

  // ─── Config Access ───

  /**
   * Get the current agent configuration.
   */
  getConfig(): SupportAgentConfig {
    return { ...this.config };
  }

  /**
   * Update the agent configuration.
   *
   * @param config - Partial config to merge
   */
  updateConfig(config: Partial<SupportAgentConfig>): void {
    this.config = { ...this.config, ...config };
    // Re-create escalation manager with new config
    this.escalationManager = new EscalationManager({
      maxAttempts: this.config.maxSolutionAttempts,
      sentimentThreshold: this.config.sentimentThreshold,
      confidenceThreshold: this.config.confidenceThreshold,
      maxConversationDurationMinutes: this.config.maxConversationDurationMinutes,
    });
    this.engine = new SupportConversationEngine(this.kb, this.escalationManager, {
      maxAttempts: this.config.maxSolutionAttempts,
    });
  }

  // ─── Private Helpers ───

  private scoreToLabel(score: number): SentimentLabel {
    if (score > 0.3) return 'positive';
    if (score > -0.3) return 'neutral';
    if (score > -0.7) return 'negative';
    return 'very_negative';
  }
}

// ─── Named Exports ───

export { SupportConversationEngine } from './conversation-engine';
export { KnowledgeBase, DEFAULT_KB_ARTICLES } from './knowledge-base';
export { EscalationManager } from './escalation-manager';
export * from './types';

// ─── Default Export ───
export default SupportAgent;
