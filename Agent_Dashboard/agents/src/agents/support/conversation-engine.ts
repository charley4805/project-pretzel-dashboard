/**
 * Conversation Engine Module
 *
 * Core conversation logic for the support agent including message handling,
 * information gathering, solution attempts, escalation decisions, sentiment
 * tracking, and a troubleshooting decision tree.
 */

import {
  type Message,
  type Conversation,
  type ConversationContext,
  type ConversationStep,
  type EscalationPackage,
  type SolutionAttempt,
  type SolutionOutcome,
  type IssueCategory,
  type SentimentLabel,
  type SentimentTrend,
  type ResolutionStatus,
  type ToneProfile,
  type AngerDetectionResult,
  type VagueIssueDetectionResult,
  type MessageProcessingResult,
  type KnowledgeBaseSearchResult,
} from './types';
import { KnowledgeBase } from './knowledge-base';
import { EscalationManager } from './escalation-manager';

/** Diagnostic question templates per issue category */
const DIAGNOSTIC_QUESTIONS: Record<IssueCategory, string[]> = {
  account: [
    'What happens when you try to log in? Do you see an error message?',
    'Are you using email/password or SSO (Google/Microsoft)?',
    'Is this happening on all devices or just one?',
    'When did you last successfully log in?',
    'Have you tried clearing your browser cache or using incognito mode?',
  ],
  billing: [
    "What's your account email so I can look up your billing details?",
    'What specifically concerns you about the charge?',
    'When did you notice this issue?',
    'Are you looking to upgrade, downgrade, or cancel?',
    'Do you have the invoice number handy?',
  ],
  technical: [
    'Can you describe exactly what you were doing when the issue occurred?',
    'What device and browser/app version are you using?',
    'Is there a specific error message? If so, what does it say?',
    'Does this happen consistently or intermittently?',
    'Have you tried refreshing the page or restarting the app?',
  ],
  integration: [
    'Which integration are you having trouble with?',
    'Did this integration work before, or is this a new setup?',
    'Have you verified your API keys/tokens are still valid?',
    'What does the error log/integration status show?',
    'Have there been any recent changes on the other platform?',
  ],
  how_to: [
    'What are you trying to accomplish?',
    'Have you used this feature before?',
    'What have you tried so far?',
    'Are you following a guide or documentation?',
    'What is your end goal with this workflow?',
  ],
  bug: [
    'Can you describe the bug in detail?',
    'When did you first notice this issue?',
    'Is this happening consistently?',
    'What steps can you take to reproduce it?',
    'Have you tried any workarounds?',
  ],
  feature_request: [
    'What feature would you like to see?',
    'What problem would this feature solve for you?',
    'How are you currently working around this limitation?',
    'Who else on your team would benefit from this?',
    'How critical is this for your workflow?',
  ],
  other: [
    'Can you tell me more about what you need help with?',
    'When did this issue start?',
    'Have you noticed any patterns with this issue?',
    'Is there anything else I should know?',
  ],
};

/** Positive resolution signals in user responses */
const POSITIVE_SIGNALS = [
  'worked',
  'fixed',
  'solved',
  'thanks',
  'thank you',
  'great',
  'perfect',
  'awesome',
  'that did it',
  'all good',
  'working now',
];

/** Negative resolution signals in user responses */
const NEGATIVE_SIGNALS = [
  "didn't work",
  'still broken',
  'same issue',
  'not working',
  'no luck',
  'still happens',
  'does not work',
  'same problem',
  'did not help',
];

/** Confusion signals in user responses */
const CONFUSION_SIGNALS = [
  "don't understand",
  'confused',
  'where is',
  'how do I',
  'not sure',
  'what do you mean',
  'can you explain',
  'lost',
];

/** Anger detection keywords */
const ANGER_SIGNALS: Record<string, string[]> = {
  explicit: [
    'angry',
    'furious',
    'ridiculous',
    'unacceptable',
    'outrageous',
    'terrible',
    'horrible',
    'worst',
  ],
  implicit: ['!!!', '???', 'WORST', 'NEVER', 'ALWAYS', 'WASTE'],
  threats: ['cancel', 'switch', 'competitor', 'review', 'refund', 'chargeback'],
  demands: ['manager', 'supervisor', 'human', 'person', 'now', 'immediately'],
};

/** Vague issue detection patterns */
const VAGUE_PATTERNS = [
  "it's not working",
  'something is wrong',
  'help',
  'broken',
  'issue',
  'problem',
  "doesn't work",
  'not working',
  'stuck',
  'trouble',
];

/**
 * Support Conversation Engine - Core conversation logic for the support agent.
 *
 * Handles the full conversation lifecycle: greeting, information gathering,
 * solution attempts, resolution verification, escalation, and closing.
 * Implements a decision-tree-based troubleshooting flow with max 5 attempts.
 *
 * @example
 * ```ts
 * const engine = new SupportConversationEngine(kb, escalationManager);
 * const result = engine.handleMessage(userMessage, conversationContext);
 * ```
 */
export class SupportConversationEngine {
  private kb: KnowledgeBase;
  private escalationManager: EscalationManager;
  private readonly maxAttempts: number;

  /**
   * Creates a new SupportConversationEngine.
   *
   * @param kb - KnowledgeBase instance for solution lookup
   * @param escalationManager - EscalationManager for handoff decisions
   * @param options - Configuration options
   * @param options.maxAttempts - Maximum solution attempts (default: 5)
   */
  constructor(
    kb: KnowledgeBase,
    escalationManager: EscalationManager,
    options: { maxAttempts?: number } = {}
  ) {
    this.kb = kb;
    this.escalationManager = escalationManager;
    this.maxAttempts = options.maxAttempts ?? 5;
  }

  /**
   * Handle an incoming message and generate a response.
   * This is the main entry point for conversation processing.
   *
   * @param message - The incoming user message
   * @param context - Current conversation context
   * @returns Processing result with response text and updated conversation state
   */
  handleMessage(
    message: Message,
    context: ConversationContext
  ): MessageProcessingResult {
    const { conversation } = context;

    // Add message to conversation history
    conversation.messages.push(message);
    conversation.timing.lastActivityAt = message.timestamp;

    // Update timing
    const started = new Date(conversation.timing.startedAt);
    const now = new Date(message.timestamp);
    conversation.timing.totalDurationMinutes = Math.floor(
      (now.getTime() - started.getTime()) / 60000
    );

    // Update sentiment
    this.updateSentiment(message, conversation);

    // Check for escalation triggers first
    const triggerCheck = this.escalationManager.evaluateEscalationTriggers(context);
    if (triggerCheck.triggered && triggerCheck.autoEscalate) {
      return this.performEscalation(conversation, context);
    }

    // Handle based on current conversation step
    const step = conversation.progress.currentStep;
    let response: string;
    const actions: string[] = [];

    switch (step) {
      case 'greeting':
        response = this.handleGreeting(conversation);
        conversation.progress.currentStep = 'information_gathering';
        actions.push('classified_issue', 'transitioned_to_info_gathering');
        break;

      case 'information_gathering':
        response = this.handleInformationGathering(message, conversation);
        if (this.hasSufficientInformation(conversation)) {
          conversation.progress.currentStep = 'solution_attempting';
          actions.push('sufficient_info_gathered', 'transitioned_to_solution');
        }
        break;

      case 'solution_attempting':
        response = this.handleSolutionAttempt(message, conversation, context);
        actions.push('solution_attempted');
        break;

      case 'escalating':
        response = this.handleEscalationMessage(conversation);
        actions.push('escalation_in_progress');
        break;

      case 'closing':
        response = this.handleClosing(message, conversation);
        actions.push('conversation_closing');
        break;

      default:
        response = this.generateFallbackResponse(conversation);
        actions.push('fallback_response');
    }

    return {
      response,
      conversation,
      escalated: false,
      actions,
    };
  }

  /**
   * Gather diagnostic information for the current issue category.
   * Returns the next question to ask based on what has already been asked.
   *
   * @param issueCategory - Category of the issue
   * @param questionsAsked - Questions already asked
   * @returns The next diagnostic question or null if all questions have been asked
   */
  gatherInformation(
    issueCategory: IssueCategory,
    questionsAsked: string[]
  ): string | null {
    const questions = DIAGNOSTIC_QUESTIONS[issueCategory] ?? DIAGNOSTIC_QUESTIONS.other;
    const remaining = questions.filter((q) => !questionsAsked.includes(q));
    return remaining.length > 0 ? remaining[0] : null;
  }

  /**
   * Attempt to find and propose a solution for the given problem.
   * Searches the knowledge base and returns the best matching solution.
   *
   * @param problemDescription - Description of the problem
   * @param category - Optional issue category for filtering
   * @returns Search result with solution or null
   */
  attemptSolution(
    problemDescription: string,
    category?: IssueCategory
  ): KnowledgeBaseSearchResult | null {
    const results = this.kb.search(problemDescription, category);

    if (results.length === 0) return null;

    // Return the best match
    const best = results[0];

    // If exact match (>90% relevance), return immediately
    if (best.relevance > 0.9) return best;

    // If similar match (>70% relevance), return with adapted confidence
    if (best.relevance > 0.7) return best;

    // If pattern match (>40% relevance), still return it
    if (best.relevance > 0.4) return best;

    // Below 40% confidence - signal that escalation may be needed
    return null;
  }

  /**
   * Determine if the conversation should be escalated based on current state.
   *
   * @param context - Conversation context
   * @returns True if escalation is needed
   */
  shouldEscalate(context: ConversationContext): boolean {
    const result = this.escalationManager.evaluateEscalationTriggers(context);
    return result.triggered && result.autoEscalate;
  }

  /**
   * Build an escalation package for the current conversation.
   *
   * @param conversation - The conversation to build the package for
   * @returns Complete escalation package
   */
  buildEscalationPackage(conversation: Conversation): EscalationPackage {
    return this.escalationManager.createEscalationPackage(conversation);
  }

  /**
   * Generate a response based on the current conversation state.
   * Uses tone adaptation and context awareness.
   *
   * @param conversation - Current conversation
   * @returns Generated response string
   */
  generateResponse(conversation: Conversation): string {
    const step = conversation.progress.currentStep;
    const tone = this.adaptTone(conversation);

    switch (step) {
      case 'greeting':
        return this.formatGreeting(conversation, tone);
      case 'information_gathering':
        return this.formatInformationRequest(conversation, tone);
      case 'solution_attempting':
        return this.formatSolutionResponse(conversation, tone);
      case 'escalating':
        return this.formatEscalationMessage(conversation, tone);
      case 'closing':
        return this.formatClosingMessage(conversation, tone);
      default:
        return "I'm here to help. Could you tell me more about the issue you're experiencing?";
    }
  }

  /**
   * Troubleshooting decision tree - determine the next step based on
   * the current step and the result of the previous action.
   *
   * @param currentStep - Current conversation step
   * @param result - Result of the previous action ('success' | 'failed' | 'needs_clarification' | 'unclear')
   * @param attemptCount - Current number of attempts
   * @returns The next conversation step
   */
  getNextStep(
    currentStep: ConversationStep,
    result: 'success' | 'failed' | 'needs_clarification' | 'unclear',
    attemptCount: number = 0
  ): ConversationStep {
    switch (currentStep) {
      case 'greeting':
        return 'information_gathering';

      case 'information_gathering':
        if (result === 'success') return 'solution_attempting';
        return 'information_gathering';

      case 'solution_attempting':
        if (result === 'success') return 'closing';
        if (result === 'needs_clarification') return 'solution_attempting';
        if (result === 'failed') {
          if (attemptCount >= this.maxAttempts) return 'escalating';
          return 'solution_attempting';
        }
        if (result === 'unclear') return 'solution_attempting';
        return 'solution_attempting';

      case 'escalating':
        return 'escalating';

      case 'closing':
        return 'closing';

      default:
        return 'information_gathering';
    }
  }

  // ─── Private Handlers ───

  private handleGreeting(conversation: Conversation): string {
    const name = conversation.userName;
    return `Hi ${name}! I'm your support specialist. How can I help you today?`;
  }

  private handleInformationGathering(
    message: Message,
    conversation: Conversation
  ): string {
    // Store gathered information
    const key = `answer_${conversation.progress.questionsAsked.length}`;
    conversation.progress.informationGathered[key] = message.content;

    // Get next question
    const nextQuestion = this.gatherInformation(
      conversation.issue.category,
      conversation.progress.questionsAsked
    );

    if (nextQuestion) {
      conversation.progress.questionsAsked.push(nextQuestion);
      return nextQuestion;
    }

    // All questions asked - transition to solution
    return "Thanks for all that information. Let me find the best solution for you.";
  }

  private handleSolutionAttempt(
    message: Message,
    conversation: Conversation,
    context: ConversationContext
  ): string {
    // Check if previous solution worked
    const resolutionStatus = this.checkResolution(message.content);

    if (resolutionStatus === 'resolved') {
      conversation.resolution.finalStatus = 'resolved';
      conversation.progress.currentStep = 'closing';
      return this.formatResolutionConfirmation(conversation);
    }

    if (resolutionStatus === 'needs_clarification') {
      return 'I want to make sure I explained that clearly. Could you tell me which part you need help with?';
    }

    // Increment attempt count for failed/unclear
    if (resolutionStatus === 'failed' || resolutionStatus === 'unclear') {
      conversation.progress.attemptCount += 1;

      // Log the failed attempt
      const attempt: SolutionAttempt = {
        step: conversation.progress.attemptCount,
        action: conversation.resolution.attemptedSolutions.at(-1)?.action ?? 'unknown',
        outcome: resolutionStatus,
        timestamp: new Date().toISOString(),
        confidence: 0.5,
      };
      conversation.resolution.attemptedSolutions.push(attempt);
    }

    // Check max attempts
    if (conversation.progress.attemptCount >= this.maxAttempts) {
      return this.initiateEscalation(conversation, context);
    }

    // Try next solution
    const problemDescription = conversation.issue.description;
    const solution = this.attemptSolution(
      problemDescription,
      conversation.issue.category
    );

    if (!solution) {
      // No KB match - try generative approach or escalate
      if (conversation.progress.attemptCount >= this.maxAttempts - 1) {
        return this.initiateEscalation(conversation, context);
      }

      return this.generateGenericTroubleshooting(conversation);
    }

    // Log the attempt
    const newAttempt: SolutionAttempt = {
      step: conversation.progress.attemptCount + 1,
      action: solution.article.title,
      outcome: 'unclear',
      timestamp: new Date().toISOString(),
      confidence: solution.relevance,
    };
    conversation.resolution.attemptedSolutions.push(newAttempt);

    return this.formatSolution(solution);
  }

  private handleEscalationMessage(conversation: Conversation): string {
    const name = conversation.userName;
    return `I want to make sure you get the best help possible, ${name}. I'm going to connect you with one of our specialists who has deeper expertise in this area. They'll pick up right where we left off - you won't need to repeat anything.`;
  }

  private handleClosing(message: Message, conversation: Conversation): string {
    const content = message.content.toLowerCase();
    const noMoreHelp = ['no', "that's it", 'nothing', 'goodbye', 'bye', 'thanks'].some(
      (kw) => content.includes(kw)
    );

    if (noMoreHelp) {
      conversation.resolution.finalStatus = 'resolved';
      return `Perfect! If you need anything else in the future, feel free to reach out. Have a great day!`;
    }

    // User has another question - restart cycle
    conversation.progress.currentStep = 'information_gathering';
    conversation.progress.attemptCount = 0;
    conversation.progress.questionsAsked = [];
    conversation.progress.informationGathered = {};
    return 'Of course! What else can I help you with?';
  }

  private performEscalation(
    conversation: Conversation,
    context: ConversationContext
  ): MessageProcessingResult {
    conversation.progress.currentStep = 'escalating';
    conversation.resolution.finalStatus = 'escalated';

    const pkg = this.buildEscalationPackage(conversation);

    // Schedule notification
    this.escalationManager.notifyHumanTeam(pkg).catch(() => {
      // Silently handle notification failure
    });

    return {
      response: this.handleEscalationMessage(conversation),
      conversation,
      escalated: true,
      escalationPackage: pkg,
      actions: ['escalated', 'escalation_package_created', 'human_team_notified'],
    };
  }

  private initiateEscalation(
    conversation: Conversation,
    context: ConversationContext
  ): string {
    conversation.progress.currentStep = 'escalating';
    conversation.resolution.finalStatus = 'escalated';

    const pkg = this.buildEscalationPackage(conversation);

    this.escalationManager.notifyHumanTeam(pkg).catch(() => {
      // Silently handle notification failure
    });

    return this.handleEscalationMessage(conversation);
  }

  // ─── Sentiment Tracking ───

  private updateSentiment(message: Message, conversation: Conversation): void {
    if (message.role !== 'user') return;

    const score = this.analyzeSentiment(message.content);
    const label = this.scoreToLabel(score);

    const sentimentScore = {
      value: score,
      label,
      timestamp: message.timestamp,
    };

    conversation.sentiment.history.push(sentimentScore);
    conversation.sentiment.currentSentiment = score;

    // Update trend
    conversation.sentiment.trend = this.calculateSentimentTrend(
      conversation.sentiment.history
    );

    // Detect frustration signals
    const frustrationSignals = this.detectFrustration(message.content);
    for (const signal of frustrationSignals) {
      if (!conversation.sentiment.frustrationSignals.includes(signal)) {
        conversation.sentiment.frustrationSignals.push(signal);
      }
    }
  }

  private analyzeSentiment(content: string): number {
    const lower = content.toLowerCase();
    let score = 0;

    // Positive words
    const positive = [
      'great',
      'awesome',
      'thanks',
      'thank',
      'good',
      'excellent',
      'perfect',
      'love',
      'amazing',
      'helpful',
    ];
    // Negative words
    const negative = [
      'terrible',
      'awful',
      'horrible',
      'hate',
      'frustrated',
      'annoying',
      'useless',
      'broken',
      'worst',
      'stupid',
      'ridiculous',
      'unacceptable',
      'angry',
      'furious',
      'disappointed',
    ];
    // Very negative intensifiers
    const intensifiers = ['very', 'extremely', 'absolutely', 'completely', 'totally'];

    let positiveCount = 0;
    let negativeCount = 0;
    let intensifierCount = 0;

    const words = lower.split(/\s+/);
    for (const word of words) {
      if (positive.some((p) => word.includes(p))) positiveCount++;
      if (negative.some((n) => word.includes(n))) negativeCount++;
      if (intensifiers.some((i) => word.includes(i))) intensifierCount++;
    }

    // Punctuation analysis
    const exclamationCount = (content.match(/!/g) || []).length;
    const capsRatio =
      content.length > 0
        ? content.replace(/\s/g, '').split('').filter((c) => c === c.toUpperCase() && /[A-Z]/.test(c)).length /
          content.replace(/\s/g, '').length
        : 0;

    score = (positiveCount - negativeCount * 1.5) * 0.15;

    // Boost negative for all caps and multiple exclamation
    if (capsRatio > 0.5) score -= 0.3;
    if (exclamationCount >= 2) score -= 0.1;
    if (intensifierCount > 0 && negativeCount > 0) score -= 0.2;

    return Math.max(-1, Math.min(1, score));
  }

  private scoreToLabel(score: number): SentimentLabel {
    if (score > 0.3) return 'positive';
    if (score > -0.3) return 'neutral';
    if (score > -0.7) return 'negative';
    return 'very_negative';
  }

  private calculateSentimentTrend(
    history: { value: number; timestamp: string }[]
  ): SentimentTrend {
    if (history.length < 3) return 'stable';

    const recent = history.slice(-3);
    const avgRecent = recent.reduce((s, h) => s + h.value, 0) / recent.length;

    const older = history.slice(-6, -3);
    if (older.length === 0) return 'stable';

    const avgOlder = older.reduce((s, h) => s + h.value, 0) / older.length;

    const diff = avgRecent - avgOlder;
    if (diff > 0.15) return 'improving';
    if (diff < -0.15) return 'declining';
    return 'stable';
  }

  private detectFrustration(content: string): string[] {
    const signals: string[] = [];
    const lower = content.toLowerCase();

    const frustrationPhrases = [
      'this is taking too long',
      'i need this working',
      "i've been waiting",
      'unacceptable',
      'ridiculous',
      'waste of time',
      'not good enough',
      'fed up',
      "i'm done",
      'cancel my',
    ];

    for (const phrase of frustrationPhrases) {
      if (lower.includes(phrase)) {
        signals.push(phrase);
      }
    }

    return signals;
  }

  // ─── Resolution Checking ───

  private checkResolution(userResponse: string): SolutionOutcome {
    const lower = userResponse.toLowerCase();

    if (POSITIVE_SIGNALS.some((s) => lower.includes(s))) {
      return 'resolved';
    }
    if (NEGATIVE_SIGNALS.some((s) => lower.includes(s))) {
      return 'failed';
    }
    if (CONFUSION_SIGNALS.some((s) => lower.includes(s))) {
      return 'needs_clarification';
    }
    return 'unclear';
  }

  // ─── Information Sufficiency ───

  private hasSufficientInformation(conversation: Conversation): boolean {
    return conversation.progress.questionsAsked.length >= 3;
  }

  // ─── Tone Adaptation ───

  private adaptTone(conversation: Conversation): ToneProfile {
    const sentiment = conversation.sentiment.currentSentiment;
    const baseTone: ToneProfile = {
      formality: 'semi_formal',
      enthusiasm: 'moderate',
      empathy: 'moderate',
      directness: 'moderate',
      technicalDetail: 'moderate',
      stepGranularity: 'detailed',
    };

    if (sentiment < -0.5) {
      baseTone.empathy = 'very_high';
      baseTone.directness = 'high';
      baseTone.formality = 'formal';
    } else if (sentiment > 0.5) {
      baseTone.enthusiasm = 'high';
      baseTone.formality = 'casual';
    }

    // Adjust for anger
    const angerResult = this.detectAnger(
      conversation.messages.at(-1)?.content ?? '',
      conversation.sentiment.history.map((h) => h.value)
    );
    if (angerResult.isAngry) {
      baseTone.empathy = 'very_high';
      baseTone.formality = 'formal';
    }

    return baseTone;
  }

  /**
   * Detect anger in a user message.
   *
   * @param message - User message to analyze
   * @param sentimentHistory - Previous sentiment scores
   * @returns Anger detection result
   */
  detectAnger(
    message: string,
    sentimentHistory: number[]
  ): AngerDetectionResult {
    let score = 0;
    const signals: string[] = [];
    const lower = message.toLowerCase();

    for (const [category, keywords] of Object.entries(ANGER_SIGNALS)) {
      for (const signal of keywords) {
        if (lower.includes(signal.toLowerCase())) {
          score += category === 'explicit' ? 2 : 1;
          signals.push(signal);
        }
      }
    }

    // Boost if sentiment declining
    if (sentimentHistory.length >= 2) {
      const current = sentimentHistory[sentimentHistory.length - 1];
      const previous = sentimentHistory[sentimentHistory.length - 2];
      if (current < previous) {
        score += 2;
        signals.push('declining_sentiment');
      }
    }

    const isAngry = score >= 2;

    return {
      isAngry,
      score,
      signals,
      recommendedApproach: isAngry
        ? 'Acknowledge frustration first, take ownership, offer tangible compensation if appropriate'
        : 'Standard support approach',
    };
  }

  /**
   * Detect vague issues that need more information.
   *
   * @param message - User message to analyze
   * @returns Vague issue detection result
   */
  detectVagueIssue(message: string): VagueIssueDetectionResult {
    const lower = message.toLowerCase();
    const patterns: string[] = [];

    for (const pattern of VAGUE_PATTERNS) {
      if (lower.includes(pattern)) {
        patterns.push(pattern);
      }
    }

    const isVague = patterns.length > 0 && message.split(/\s+/).length < 10;

    const suggestedQuestions = isVague
      ? [
          'Is this happening when you try to do a specific action, or all the time?',
          'Are you on the web app, desktop app, or mobile?',
          'Did this start today or has it been ongoing?',
          'Is anyone else on your team experiencing this?',
        ]
      : [];

    return { isVague, patterns, suggestedQuestions };
  }

  // ─── Response Formatting ───

  private formatGreeting(conversation: Conversation, tone: ToneProfile): string {
    const name = conversation.userName;
    const formality = tone.formality;

    if (formality === 'casual') {
      return `Hey ${name}! Great to see you again. What can I help with today?`;
    }
    return `Hi ${name}! I'm your support specialist. How can I help you today?`;
  }

  private formatInformationRequest(
    conversation: Conversation,
    tone: ToneProfile
  ): string {
    const empathy =
      tone.empathy === 'very_high'
        ? "I really want to get this sorted for you. "
        : '';
    return `${empathy}To help me understand better, could you tell me:`;
  }

  private formatSolutionResponse(
    conversation: Conversation,
    tone: ToneProfile
  ): string {
    const empathy =
      tone.empathy === 'very_high'
        ? "I know this has been frustrating. Let's try this: "
        : "Here's what to try: ";
    return empathy;
  }

  private formatEscalationMessage(
    conversation: Conversation,
    tone: ToneProfile
  ): string {
    const name = conversation.userName;
    const empathy =
      tone.empathy === 'very_high'
        ? `I completely understand your frustration, ${name}. `
        : '';
    return `${empathy}I'm going to connect you with one of our specialists who has deeper expertise in this area. They'll pick up right where we left off - you won't need to repeat anything.`;
  }

  private formatClosingMessage(
    conversation: Conversation,
    tone: ToneProfile
  ): string {
    const name = conversation.userName;
    return `Great to hear that worked, ${name}! I'm glad we got that sorted out. Is there anything else I can help you with today?`;
  }

  private formatResolutionConfirmation(conversation: Conversation): string {
    const name = conversation.userName;
    return `That's awesome, ${name}! I'm so glad that fixed it. Is there anything else I can help you with?`;
  }

  private formatSolution(solution: KnowledgeBaseSearchResult): string {
    const article = solution.article;
    const steps = article.steps;

    let response = `Let's try this: ${article.title.toLowerCase()}. `;

    if (steps && steps.length > 0) {
      if (steps.length <= 3) {
        response += steps.join(' → ');
      } else {
        response +=
          '\n' +
          steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
      }
    } else {
      response += article.content;
    }

    response += "\n\nTake your time - let me know how it goes!";
    return response;
  }

  private generateGenericTroubleshooting(conversation: Conversation): string {
    const tone = this.adaptTone(conversation);
    const empathy =
      tone.empathy === 'very_high'
        ? "I really want to help you get this resolved. "
        : '';

    return `${empathy}Let me walk you through some general troubleshooting steps:

1. Refresh the page or restart the app
2. Clear your browser cache and cookies
3. Try using an incognito/private browser window
4. Disable any browser extensions temporarily
5. Check your internet connection

Please try these steps and let me know if the issue persists.`;
  }

  private generateFallbackResponse(conversation: Conversation): string {
    return "I'm not sure I understood that correctly. Could you tell me more about the issue you're experiencing?";
  }

  // ─── Summary ───

  /**
   * Generate a conversation summary for the dashboard/escalation package.
   *
   * @param conversation - Conversation to summarize
   * @returns Summary string
   */
  generateConversationSummary(conversation: Conversation): string {
    const msgCount = conversation.messages.length;
    const duration = conversation.timing.totalDurationMinutes;
    const category = conversation.issue.category;
    const status = conversation.resolution.finalStatus;
    const attempts = conversation.progress.attemptCount;

    return `${msgCount} messages over ${duration}min. Category: ${category}. Status: ${status}. ${attempts} solution(s) attempted. Sentiment: ${conversation.sentiment.currentSentiment.toFixed(2)} (${conversation.sentiment.trend}).`;
  }
}

export default SupportConversationEngine;
