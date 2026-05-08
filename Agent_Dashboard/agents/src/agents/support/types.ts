/**
 * Support Agent - Type Definitions
 *
 * Core interfaces and types for the support agent module including
 * conversations, messages, escalation packages, solution attempts,
 * sentiment tracking, and conversation state management.
 */

/** Issue categories supported by the support agent */
export type IssueCategory =
  | 'account'
  | 'billing'
  | 'technical'
  | 'integration'
  | 'how_to'
  | 'bug'
  | 'feature_request'
  | 'other';

/** Urgency levels for issues */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

/** Conversation step / state machine states */
export type ConversationStep =
  | 'greeting'
  | 'information_gathering'
  | 'solution_attempting'
  | 'escalating'
  | 'closing';

/** Sentiment labels for quick classification */
export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'very_negative';

/** Sentiment trend direction */
export type SentimentTrend = 'improving' | 'stable' | 'declining';

/** Final resolution status of a conversation */
export type ResolutionStatus = 'resolved' | 'escalated' | 'unresolved' | 'in_progress';

/** Outcome of a single solution attempt */
export type SolutionOutcome =
  | 'resolved'
  | 'failed'
  | 'needs_clarification'
  | 'unclear'
  | 'confirmed_working'
  | 'customer_unsure_how'
  | 'followed_but_issue_persists'
  | 'customer_confirmed_settings_correct'
  | 'within_limits_issue_continues';

/** Role of a message sender */
export type MessageRole = 'user' | 'agent';

/** Reason for escalation */
export type EscalationReason =
  | 'max_attempts_reached'
  | 'user_requests_human'
  | 'sentiment_very_negative'
  | 'billing_refund_request'
  | 'legal_or_security_concern'
  | 'system_wide_outage'
  | 'feature_request'
  | 'low_confidence'
  | 'user_mentions_lawsuit'
  | 'conversation_timeout';

/** Escalation priority */
export type EscalationPriority = 'low' | 'medium' | 'high' | 'critical';

/** Account health indicator */
export type AccountHealth = 'healthy' | 'at_risk' | 'churn_risk';

/** Churn risk level */
export type ChurnRiskLevel = 'low' | 'medium' | 'high';

/** Individual chat message */
export interface Message {
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/** Sentiment score with history entry */
export interface SentimentScore {
  value: number; // -1.0 to 1.0
  label: SentimentLabel;
  timestamp: string;
}

/** Sentiment analysis result */
export interface SentimentAnalysis {
  initialSentiment: number;
  currentSentiment: number;
  history: SentimentScore[];
  trend: SentimentTrend;
  frustrationSignals: string[];
}

/** Single solution attempt record */
export interface SolutionAttempt {
  step: number;
  action: string;
  outcome: SolutionOutcome;
  timestamp: string;
  confidence: number;
}

/** Issue classification result */
export interface IssueClassification {
  category: IssueCategory;
  subCategory: string;
  urgency: UrgencyLevel;
  confidence: number;
  description: string;
}

/** Conversation timing metadata */
export interface ConversationTiming {
  startedAt: string;
  lastActivityAt: string;
  totalDurationMinutes: number;
}

/** Conversation progress tracking */
export interface ConversationProgress {
  currentStep: ConversationStep;
  attemptCount: number;
  maxAttempts: number;
  questionsAsked: string[];
  informationGathered: Record<string, unknown>;
}

/** Resolution tracking */
export interface ConversationResolution {
  attemptedSolutions: SolutionAttempt[];
  finalStatus: ResolutionStatus;
  satisfactionScore: number | null;
}

/** Issue tracking within a conversation */
export interface ConversationIssue {
  category: IssueCategory;
  subCategory: string;
  description: string;
  urgency: UrgencyLevel;
}

/** Full conversation context/state object */
export interface Conversation {
  conversationId: string;
  userId: string;
  userName: string;
  userPlan: string;
  issue: ConversationIssue;
  progress: ConversationProgress;
  sentiment: SentimentAnalysis;
  resolution: ConversationResolution;
  timing: ConversationTiming;
  messages: Message[];
}

/** Customer info within escalation package */
export interface EscalationCustomer {
  userId: string;
  name: string;
  email: string;
  plan: string;
  signupDate: string;
  ltv: string;
  previousTickets: number;
  csatAverage: number;
}

/** Conversation section of escalation package */
export interface EscalationConversation {
  conversationId: string;
  durationMinutes: number;
  messageCount: number;
  summary: string;
  fullTranscript: Message[];
}

/** Diagnostics section of escalation package */
export interface EscalationDiagnostics {
  issueCategory: IssueCategory;
  subCategory: string;
  urgency: UrgencyLevel;
  attemptedSolutions: SolutionAttempt[];
  keyFindings: string[];
}

/** Recommendation section of escalation package */
export interface EscalationRecommendation {
  suggestedTeam: string;
  suggestedPriority: EscalationPriority;
  estimatedComplexity: 'low' | 'medium' | 'high';
  recommendedAssigneeSkills: string[];
  notes: string;
}

/** Business context within escalation package */
export interface EscalationBusinessContext {
  accountHealth: AccountHealth;
  churnRisk: ChurnRiskLevel;
  expansionOpportunity: string;
  contractRenewalDate: string | null;
}

/** Complete escalation package for human handoff */
export interface EscalationPackage {
  escalationId: string;
  timestamp: string;
  priority: EscalationPriority;
  reason: EscalationReason;
  customer: EscalationCustomer;
  conversation: EscalationConversation;
  diagnostics: EscalationDiagnostics;
  sentimentAnalysis: SentimentAnalysis;
  recommendation: EscalationRecommendation;
  businessContext: EscalationBusinessContext;
}

/** Knowledge base article */
export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: IssueCategory;
  subCategory: string;
  tags: string[];
  steps?: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

/** Knowledge base search result */
export interface KnowledgeBaseSearchResult {
  article: KnowledgeBaseArticle;
  relevance: number;
  matchType: 'exact' | 'similar' | 'pattern';
}

/** Sentiment analysis input for a message */
export interface SentimentInput {
  message: string;
  conversationId: string;
  previousSentiment?: number;
}

/** Conversation context for engine processing */
export interface ConversationContext {
  conversation: Conversation;
  userProfile?: UserProfile;
  systemStatus?: SystemStatus;
  activeOutages?: string[];
}

/** User profile for cross-session context */
export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  plan: string;
  planStartDate: string;
  signupDate: string;
  pastTickets: number;
  issuePatterns: string[];
  technicalLevel: 'technical' | 'non_technical' | 'mixed';
  detailPreference: 'concise' | 'detailed' | 'very_detailed';
  patienceIndicator: 'patient' | 'neutral' | 'impatient';
  csatAverage: number;
  ltv: string;
}

/** System status information */
export interface SystemStatus {
  status: 'operational' | 'degraded' | 'major_outage';
  activeIncidents: string[];
  lastUpdated: string;
}

/** Escalation trigger check result */
export interface EscalationTriggerResult {
  triggered: boolean;
  reason: EscalationReason | null;
  priority: EscalationPriority | null;
  autoEscalate: boolean;
  details: string;
}

/** Tone profile for response adaptation */
export interface ToneProfile {
  formality: 'casual' | 'semi_formal' | 'formal';
  enthusiasm: 'low' | 'moderate' | 'high';
  empathy: 'low' | 'moderate' | 'high' | 'very_high';
  directness: 'low' | 'moderate' | 'high';
  technicalDetail: 'low' | 'moderate' | 'high';
  stepGranularity: 'summary' | 'detailed' | 'very_detailed';
}

/** Anger detection result */
export interface AngerDetectionResult {
  isAngry: boolean;
  score: number;
  signals: string[];
  recommendedApproach: string;
}

/** Vague issue detection result */
export interface VagueIssueDetectionResult {
  isVague: boolean;
  patterns: string[];
  suggestedQuestions: string[];
}

/** Configuration for the support agent */
export interface SupportAgentConfig {
  agentName: string;
  companyName: string;
  productDescription: string;
  escalationSla: string;
  urgentSla: string;
  businessHoursStart: string;
  maxSolutionAttempts: number;
  maxConversationDurationMinutes: number;
  sentimentThreshold: number;
  confidenceThreshold: number;
  autoEscalationEnabled: boolean;
}

/** Notification channel for escalation alerts */
export interface NotificationChannel {
  type: 'websocket' | 'slack' | 'teams' | 'email';
  config: Record<string, string>;
}

/** Result of processing a message through the support agent */
export interface MessageProcessingResult {
  response: string;
  conversation: Conversation;
  escalated: boolean;
  escalationPackage?: EscalationPackage;
  actions: string[];
}
