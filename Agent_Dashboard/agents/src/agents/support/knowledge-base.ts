/**
 * Knowledge Base Module
 *
 * In-memory knowledge base with realistic FAQ data for a generic SaaS app.
 * Provides semantic-style search, article retrieval, and article management.
 * Covers account issues, billing, technical problems, and integrations.
 */

import {
  type KnowledgeBaseArticle,
  type KnowledgeBaseSearchResult,
  type IssueCategory,
} from './types';

/** Default mock FAQ articles for the knowledge base */
export const DEFAULT_KB_ARTICLES: KnowledgeBaseArticle[] = [
  // ─── Account Issues ───
  {
    id: 'kb-acc-001',
    title: 'How to reset your password',
    content:
      'If you forgot your password or are having trouble logging in, you can reset it from the login page. Click "Forgot Password" and enter your email address. You will receive a reset link within 2 minutes. If you do not see the email, check your spam folder.',
    category: 'account',
    subCategory: 'login',
    tags: ['password', 'login', 'reset', 'forgot', 'email', 'authentication'],
    steps: [
      'Go to the login page and click "Forgot Password"',
      'Enter your registered email address',
      'Check your inbox (and spam folder) for the reset link',
      'Click the link and enter a new password',
      'Log in with your new password',
    ],
    confidence: 0.95,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-acc-002',
    title: 'Account locked after too many login attempts',
    content:
      'For security, accounts are temporarily locked after 5 failed login attempts. The lock lasts for 30 minutes. You can also unlock immediately by clicking the "Unlock Account" link in the notification email sent after the 5th attempt, or by contacting support.',
    category: 'account',
    subCategory: 'login',
    tags: ['locked', 'login', 'failed', 'attempts', 'security', 'unlock'],
    steps: [
      'Wait 30 minutes for the automatic unlock',
      'Or use the "Unlock Account" link in your notification email',
      'Reset your password if you have forgotten it',
      'Enable two-factor authentication to prevent unauthorized attempts',
    ],
    confidence: 0.98,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-acc-003',
    title: 'Setting up two-factor authentication (2FA)',
    content:
      'Two-factor authentication adds an extra layer of security to your account. Go to Settings > Security > Two-Factor Authentication. You can use an authenticator app (Google Authenticator, Authy) or SMS. We recommend using an authenticator app for better security.',
    category: 'account',
    subCategory: 'mfa',
    tags: ['2fa', 'mfa', 'security', 'authentication', 'authenticator', 'sms'],
    steps: [
      'Go to Settings > Security > Two-Factor Authentication',
      'Choose your preferred method: Authenticator App or SMS',
      'Scan the QR code with your authenticator app',
      'Enter the 6-digit verification code to confirm',
      'Save your backup codes in a secure location',
    ],
    confidence: 0.92,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-acc-004',
    title: 'How to update your profile information',
    content:
      'You can update your name, email, profile picture, and timezone from the Settings page. Navigate to Settings > Profile to make changes. Note that changing your email address will require verification of the new email.',
    category: 'account',
    subCategory: 'profile',
    tags: ['profile', 'settings', 'email', 'name', 'timezone', 'update'],
    steps: [
      'Go to Settings > Profile',
      'Update your desired fields (name, timezone, avatar)',
      'Click "Save Changes"',
      'Verify your new email address if you changed it',
    ],
    confidence: 0.9,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-acc-005',
    title: 'SSO login issues with Google or Microsoft',
    content:
      'If you are experiencing issues with SSO login, ensure your browser allows third-party cookies. Try clearing your browser cache and logging in again. If the issue persists, your SSO provider may have expired your session - try disconnecting and reconnecting the integration.',
    category: 'account',
    subCategory: 'sso',
    tags: ['sso', 'google', 'microsoft', 'oauth', 'login', 'third-party', 'cookies'],
    steps: [
      'Ensure third-party cookies are enabled in your browser',
      'Clear your browser cache and cookies',
      'Try logging in via incognito/private mode',
      'Disconnect and reconnect the SSO integration in Settings > Security',
      'Contact your IT administrator to verify SSO configuration',
    ],
    confidence: 0.88,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // ─── Billing Issues ───
  {
    id: 'kb-bil-001',
    title: 'Understanding your invoice and charges',
    content:
      'Invoices are generated on your billing cycle date and emailed to the billing contact on file. You can view and download all invoices from Settings > Billing > Invoices. Charges include your base plan, seat licenses, and any overage fees for usage beyond your plan limits.',
    category: 'billing',
    subCategory: 'invoices',
    tags: ['invoice', 'billing', 'charges', 'payment', 'plan', 'receipt'],
    steps: [
      'Go to Settings > Billing > Invoices',
      'Click on any invoice to view the detailed breakdown',
      'Download a PDF copy if needed',
      'For questions about specific charges, click "Dispute Charge" on the invoice line item',
    ],
    confidence: 0.9,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-bil-002',
    title: 'How to upgrade or downgrade your plan',
    content:
      'You can change your plan at any time from Settings > Billing > Plan. Upgrades take effect immediately and are prorated. Downgrades take effect at the end of your current billing cycle. When upgrading, you will receive a credit for unused time on your old plan.',
    category: 'billing',
    subCategory: 'upgrades',
    tags: ['upgrade', 'downgrade', 'plan', 'billing', 'subscription', 'change'],
    steps: [
      'Go to Settings > Billing > Plan',
      'Select the new plan you want',
      'Review the prorated cost or effective date',
      'Click "Confirm Plan Change"',
      'You will receive a confirmation email with the change details',
    ],
    confidence: 0.93,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-bil-003',
    title: 'Payment failed - how to update your payment method',
    content:
      'If your payment fails, we will retry up to 3 times over 7 days. During this time, your account remains active. Update your payment method in Settings > Billing > Payment Methods. We accept credit cards (Visa, Mastercard, Amex) and PayPal.',
    category: 'billing',
    subCategory: 'payment',
    tags: ['payment', 'failed', 'card', 'billing', 'update', 'method'],
    steps: [
      'Go to Settings > Billing > Payment Methods',
      'Click "Add Payment Method" or edit an existing one',
      'Enter your new card details or PayPal info',
      'Set it as the default payment method',
      'Click "Retry Payment" if you want to process the failed charge immediately',
    ],
    confidence: 0.92,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-bil-004',
    title: 'How to cancel your subscription',
    content:
      'You can cancel your subscription from Settings > Billing > Plan > Cancel Subscription. Your account will remain active until the end of your current billing period. After cancellation, you can export your data for 30 days. We retain your data for 90 days in case you decide to reactivate.',
    category: 'billing',
    subCategory: 'cancellation',
    tags: ['cancel', 'subscription', 'termination', 'close account', 'refund'],
    steps: [
      'Go to Settings > Billing > Plan',
      'Click "Cancel Subscription" at the bottom',
      'Complete the exit survey (optional but appreciated)',
      'Confirm the cancellation',
      'Your access continues until the end of the billing period',
    ],
    confidence: 0.91,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // ─── Technical Problems ───
  {
    id: 'kb-tech-001',
    title: 'Page not loading or blank screen',
    content:
      'If the app is not loading or showing a blank screen, this is usually caused by browser cache issues, outdated browsers, or extensions interfering. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R), clear your browser cache, or try an incognito window.',
    category: 'technical',
    subCategory: 'loading',
    tags: ['blank', 'loading', 'page', 'error', 'browser', 'cache', 'refresh'],
    steps: [
      'Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)',
      'Clear your browser cache and cookies',
      'Try an incognito/private browser window',
      'Disable browser extensions temporarily',
      'Ensure your browser is up to date (Chrome, Firefox, Safari, Edge)',
    ],
    confidence: 0.94,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-tech-002',
    title: 'App is slow or laggy',
    content:
      'Performance issues can be caused by large data sets, browser memory limits, or network latency. Try refreshing the page, closing unnecessary browser tabs, or checking your internet connection. If you are working with large files, consider splitting them into smaller batches.',
    category: 'technical',
    subCategory: 'performance',
    tags: ['slow', 'performance', 'lag', 'speed', 'loading', 'timeout'],
    steps: [
      'Check your internet connection speed',
      'Close unnecessary browser tabs and applications',
      'Refresh the page',
      'If working with large datasets, try filtering or paginating',
      'Clear browser cache',
      'Try a different browser or device',
    ],
    confidence: 0.85,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-tech-003',
    title: 'Error 500 - Internal Server Error',
    content:
      'A 500 error indicates a problem on our servers. These are usually temporary. Wait a few minutes and try again. If the error persists for more than 15 minutes, check our status page or contact support. We are automatically alerted when these errors occur.',
    category: 'technical',
    subCategory: 'errors',
    tags: ['500', 'error', 'server', 'internal', 'crash', 'down'],
    steps: [
      'Wait 2-3 minutes and refresh the page',
      'Check our status page for known outages',
      'Clear your browser cache',
      'If the error persists after 15 minutes, contact support',
    ],
    confidence: 0.95,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-tech-004',
    title: 'Error 403 - Forbidden / Access Denied',
    content:
      'A 403 error means you do not have permission to access the requested resource. This could be due to role-based permissions, expired session, or IP restrictions. Try logging out and back in. If the issue persists, contact your workspace admin to verify your permissions.',
    category: 'technical',
    subCategory: 'errors',
    tags: ['403', 'forbidden', 'access denied', 'permissions', 'unauthorized'],
    steps: [
      'Log out and log back in',
      'Verify you have the correct role/permissions for this resource',
      'Ask your workspace admin to check your access level',
      'If using a VPN, try disabling it temporarily',
    ],
    confidence: 0.92,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-tech-005',
    title: 'Export or download is failing',
    content:
      'Export failures are often caused by browser pop-up blockers, large file sizes, or network timeouts. Ensure pop-ups are allowed for our domain. For large exports, try filtering the data to a smaller date range or fewer records. CSV exports over 100,000 rows may need to be split.',
    category: 'technical',
    subCategory: 'export',
    tags: ['export', 'download', 'csv', 'pdf', 'failed', 'popup', 'file'],
    steps: [
      'Allow pop-ups for our domain in your browser settings',
      'For large datasets, filter to a smaller date range',
      'Try a different file format (CSV instead of Excel)',
      'Split exports into smaller batches (under 100,000 rows)',
      'Try a different browser',
    ],
    confidence: 0.87,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // ─── Integration Issues ───
  {
    id: 'kb-int-001',
    title: 'Salesforce integration sync failures',
    content:
      'Sync failures between our platform and Salesforce are usually caused by expired API tokens, field mapping changes, or API rate limits. Verify your Salesforce connection in Settings > Integrations > Salesforce. Check that your API user has the correct permissions and that you have not exceeded your daily API call limit.',
    category: 'integration',
    subCategory: 'salesforce',
    tags: ['salesforce', 'sync', 'crm', 'api', 'integration', 'data sync'],
    steps: [
      'Go to Settings > Integrations > Salesforce',
      'Click "Test Connection" to verify the API token is valid',
      'Check the field mapping configuration',
      'Verify your Salesforce API call limits are not exceeded',
      'Check Salesforce field-level security for the mapped fields',
      'Re-authorize the connection if the token has expired',
    ],
    confidence: 0.9,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-int-002',
    title: 'Slack webhook not receiving notifications',
    content:
      'If Slack notifications are not coming through, the webhook URL may be invalid or the Slack app may have been uninstalled. Go to Settings > Integrations > Slack and verify the webhook URL. Reconnect the integration if needed and ensure the Slack app has the correct channel permissions.',
    category: 'integration',
    subCategory: 'slack',
    tags: ['slack', 'webhook', 'notifications', 'integration', 'messaging'],
    steps: [
      'Go to Settings > Integrations > Slack',
      'Verify the webhook URL is correct and active',
      'Test the connection with the "Send Test Message" button',
      'Re-install the Slack app if needed',
      'Check that the target channel still exists and the bot has access',
    ],
    confidence: 0.89,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-int-003',
    title: 'API key authentication errors',
    content:
      'API authentication errors are typically caused by expired keys, incorrect key format, or IP whitelisting restrictions. Check that you are using the correct API key (not the webhook secret). Verify the key is passed in the Authorization header with the Bearer prefix. If IP whitelisting is enabled, ensure your server IP is on the allowlist.',
    category: 'integration',
    subCategory: 'api',
    tags: ['api', 'key', 'authentication', '401', 'unauthorized', 'token'],
    steps: [
      'Verify you are using the correct API key from Settings > API',
      'Ensure the key is passed as: Authorization: Bearer YOUR_KEY',
      'Check if the API key has expired and regenerate if needed',
      'Verify your server IP is on the allowlist (if IP restriction is enabled)',
      'Check the API key has the required scopes/permissions',
    ],
    confidence: 0.93,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-int-004',
    title: 'Zapier integration triggers not firing',
    content:
      'If your Zapier triggers are not firing, the most common causes are: the Zap is turned off, authentication has expired, or the trigger conditions are not being met. In Zapier, check that the Zap is turned on and run a test from the Zap editor. Re-authenticate the connection if needed.',
    category: 'integration',
    subCategory: 'zapier',
    tags: ['zapier', 'automation', 'trigger', 'workflow', 'integration'],
    steps: [
      'In Zapier, verify the Zap is turned ON',
      'Run a test from the Zap editor to check for errors',
      'Re-authenticate the connection to our platform',
      'Check that the trigger conditions match your expected events',
      'Review the Zapier task history for error messages',
    ],
    confidence: 0.86,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // ─── How-To Questions ───
  {
    id: 'kb-how-001',
    title: 'How to create a new project',
    content:
      'Creating a new project is simple. From the dashboard, click the "+ New Project" button. Enter a project name, select a template (optional), and choose your project settings. You can invite team members during creation or add them later from the project settings.',
    category: 'how_to',
    subCategory: 'projects',
    tags: ['project', 'create', 'new', 'setup', 'getting started'],
    steps: [
      'From the dashboard, click "+ New Project"',
      'Enter a name for your project',
      'Choose a template or start from blank',
      'Configure project settings (visibility, defaults)',
      'Click "Create Project"',
      'Invite team members (optional)',
    ],
    confidence: 0.95,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-how-002',
    title: 'How to invite team members',
    content:
      'You can invite team members from Settings > Team > Invite Members. Enter their email addresses and select their role (Admin, Editor, or Viewer). Invited members will receive an email invitation link. You can also generate an invite link to share directly.',
    category: 'how_to',
    subCategory: 'team',
    tags: ['invite', 'team', 'members', 'collaboration', 'roles', 'permissions'],
    steps: [
      'Go to Settings > Team > Invite Members',
      'Enter the email addresses of the people you want to invite',
      'Select their role (Admin, Editor, or Viewer)',
      'Click "Send Invitations"',
      'Alternatively, generate a shareable invite link',
    ],
    confidence: 0.94,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-how-003',
    title: 'Setting up custom fields and properties',
    content:
      'Custom fields let you track additional data specific to your workflow. Go to Settings > Custom Fields to create new fields. Supported types include text, number, date, dropdown, multi-select, and user reference. Custom fields can be applied at the project, task, or record level.',
    category: 'how_to',
    subCategory: 'configuration',
    tags: ['custom fields', 'properties', 'configuration', 'workflow', 'data'],
    steps: [
      'Go to Settings > Custom Fields',
      'Click "Add Custom Field"',
      'Choose the field type (text, number, date, dropdown, etc.)',
      'Set the field name, description, and default value',
      'Choose where the field applies (project, task, record)',
      'Click "Save"',
    ],
    confidence: 0.88,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-how-004',
    title: 'How to set up automated workflows',
    content:
      'Automated workflows help you streamline repetitive tasks. Go to the Automations section in your project. Click "Create Workflow" and choose a trigger (e.g., "When status changes to...") and an action (e.g., "Send notification to..."). You can add multiple conditions and actions to a single workflow.',
    category: 'how_to',
    subCategory: 'automation',
    tags: ['automation', 'workflow', 'trigger', 'actions', 'rules', 'automate'],
    steps: [
      'Go to your project and click the Automations tab',
      'Click "Create Workflow"',
      'Select a trigger event (status change, new item, due date, etc.)',
      'Add conditions if needed (e.g., only for certain project types)',
      'Choose the action to perform (send email, update field, notify Slack)',
      'Test the workflow with the "Run Test" button',
      'Enable the workflow',
    ],
    confidence: 0.85,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-how-005',
    title: 'Using keyboard shortcuts for productivity',
    content:
      'Keyboard shortcuts can speed up your workflow significantly. Press "?" from anywhere in the app to see the full shortcut list. Common shortcuts: Cmd/Ctrl+K for the command palette, Cmd/Ctrl+N for new items, Escape to close modals, and / to focus the search bar.',
    category: 'how_to',
    subCategory: 'shortcuts',
    tags: ['keyboard', 'shortcuts', 'productivity', 'hotkeys', 'tips'],
    steps: [
      'Press "?" anywhere in the app to open the shortcuts help panel',
      'Use Cmd/Ctrl+K for the command palette',
      'Use Cmd/Ctrl+N to create new items quickly',
      'Use "j" and "k" to navigate lists',
      'Use "/" to focus the search bar',
    ],
    confidence: 0.82,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // ─── Bug Reports ───
  {
    id: 'kb-bug-001',
    title: 'Known issue: Mobile app crash on iOS 17',
    content:
      'We are aware of a crash affecting the iOS app on version 17.x when opening large projects. Our engineering team is actively working on a fix. As a workaround, use the web app on Safari mobile or split your project into smaller sections. A fix is expected in the next release (v3.4.2).',
    category: 'bug',
    subCategory: 'mobile',
    tags: ['ios', 'crash', 'mobile', 'bug', 'known issue', 'workaround'],
    steps: [
      'Use the web app on Safari mobile as a temporary workaround',
      'Split large projects into smaller sections',
      'Ensure your iOS app is updated to the latest version',
      'Subscribe to release notifications for the fix update',
    ],
    confidence: 0.96,
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'kb-bug-002',
    title: 'Dashboard charts not updating in real-time',
    content:
      'We have identified an issue where dashboard charts may not reflect the latest data without a manual refresh. This affects analytics widgets and activity feeds. The underlying data is correct - it is a display caching issue. We are deploying a fix. In the meantime, press F5 or use the refresh button on the dashboard.',
    category: 'bug',
    subCategory: 'dashboard',
    tags: ['dashboard', 'charts', 'real-time', 'refresh', 'cache', 'display'],
    steps: [
      'Click the refresh button on the dashboard or press F5',
      'The data itself is correct - it is only the display that is delayed',
      'A fix is being deployed; clear your cache after the update',
    ],
    confidence: 0.94,
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },

  // ─── Feature Requests ───
  {
    id: 'kb-feat-001',
    title: 'How to submit a feature request',
    content:
      'We love hearing your ideas. You can submit feature requests from the Help menu > Submit Feedback. Include as much detail as possible about the use case, who would benefit, and any workarounds you have tried. Our product team reviews all submissions weekly. You can also vote on existing requests from our public roadmap.',
    category: 'feature_request',
    subCategory: 'feedback',
    tags: ['feature', 'request', 'feedback', 'roadmap', 'idea', 'suggestion'],
    steps: [
      'Go to Help > Submit Feedback',
      'Select "Feature Request" as the type',
      'Describe the feature and the problem it solves',
      'Include any mockups or examples if possible',
      'Submit and vote on similar requests in our public roadmap',
    ],
    confidence: 0.9,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
];

/**
 * Knowledge Base - In-memory store with search capabilities.
 *
 * Provides semantic-style text search across articles, category filtering,
 * and CRUD operations for managing help content.
 *
 * @example
 * ```ts
 * const kb = new KnowledgeBase();
 * const results = kb.search('password reset');
 * const article = kb.getArticle('kb-acc-001');
 * ```
 */
export class KnowledgeBase {
  private articles: Map<string, KnowledgeBaseArticle> = new Map();

  /**
   * Creates a new KnowledgeBase instance.
   * @param initialArticles - Optional array of articles to pre-populate the KB
   */
  constructor(initialArticles: KnowledgeBaseArticle[] = DEFAULT_KB_ARTICLES) {
    for (const article of initialArticles) {
      this.articles.set(article.id, article);
    }
  }

  /**
   * Search the knowledge base for articles matching the query.
   * Performs a relevance-scored text search across titles, content, tags, and categories.
   *
   * @param query - Search query string
   * @param category - Optional category filter
   * @returns Array of search results sorted by relevance (highest first)
   */
  search(query: string, category?: IssueCategory): KnowledgeBaseSearchResult[] {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const queryTerms = normalizedQuery.split(/\s+/);
    const results: KnowledgeBaseSearchResult[] = [];

    for (const article of this.articles.values()) {
      // Category filter
      if (category && article.category !== category) {
        continue;
      }

      const relevance = this.calculateRelevance(article, queryTerms, normalizedQuery);
      if (relevance > 0) {
        let matchType: 'exact' | 'similar' | 'pattern' = 'pattern';
        if (relevance > 0.9) matchType = 'exact';
        else if (relevance > 0.5) matchType = 'similar';

        results.push({ article, relevance, matchType });
      }
    }

    // Sort by relevance descending
    results.sort((a, b) => b.relevance - a.relevance);
    return results;
  }

  /**
   * Retrieve a single article by its ID.
   *
   * @param id - Article ID
   * @returns The article or undefined if not found
   */
  getArticle(id: string): KnowledgeBaseArticle | undefined {
    return this.articles.get(id);
  }

  /**
   * Add a new article to the knowledge base.
   *
   * @param article - Article to add
   * @returns The added article
   */
  addArticle(article: KnowledgeBaseArticle): KnowledgeBaseArticle {
    this.articles.set(article.id, article);
    return article;
  }

  /**
   * Remove an article from the knowledge base.
   *
   * @param id - ID of the article to remove
   * @returns True if the article was removed, false if not found
   */
  removeArticle(id: string): boolean {
    return this.articles.delete(id);
  }

  /**
   * Get all articles, optionally filtered by category.
   *
   * @param category - Optional category filter
   * @returns Array of articles
   */
  getAllArticles(category?: IssueCategory): KnowledgeBaseArticle[] {
    const all = Array.from(this.articles.values());
    if (category) {
      return all.filter((a) => a.category === category);
    }
    return all;
  }

  /**
   * Get the total count of articles in the knowledge base.
   */
  getArticleCount(): number {
    return this.articles.size;
  }

  /**
   * Calculate relevance score for an article against search terms.
   * Uses a weighted scoring system across multiple fields.
   *
   * @param article - Article to score
   * @param queryTerms - Individual search terms
   * @param fullQuery - Full normalized query string
   * @returns Relevance score between 0 and 1
   */
  private calculateRelevance(
    article: KnowledgeBaseArticle,
    queryTerms: string[],
    fullQuery: string
  ): number {
    let score = 0;
    const title = article.title.toLowerCase();
    const content = article.content.toLowerCase();
    const tags = article.tags.map((t) => t.toLowerCase());
    const subCategory = article.subCategory.toLowerCase();

    // Title matches (highest weight)
    if (title.includes(fullQuery)) {
      score += 0.5;
    }
    for (const term of queryTerms) {
      if (title.includes(term)) score += 0.15;
    }

    // Tag matches (high weight)
    for (const term of queryTerms) {
      if (tags.some((tag) => tag.includes(term))) score += 0.2;
    }

    // Content matches (medium weight)
    if (content.includes(fullQuery)) {
      score += 0.25;
    }
    for (const term of queryTerms) {
      // Count occurrences in content
      const occurrences = content.split(term).length - 1;
      score += Math.min(occurrences * 0.03, 0.15);
    }

    // Sub-category match
    for (const term of queryTerms) {
      if (subCategory.includes(term)) score += 0.1;
    }

    // Boost by article confidence
    score *= (0.8 + article.confidence * 0.2);

    return Math.min(score, 1.0);
  }
}

export default KnowledgeBase;
