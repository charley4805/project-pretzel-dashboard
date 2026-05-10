# DEPLOYMENT GUIDE

**Status**: Ready for Phase 9 & 10  
**Last Updated**: May 9, 2026

---

## TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Monitoring & Rollback](#monitoring--rollback)
5. [Post-Deployment Validation](#post-deployment-validation)

---

## PRE-DEPLOYMENT CHECKLIST

### Code Quality (Phase 8 Complete)
- [ ] All 16 pages compile without errors
- [ ] No console errors in any route
- [ ] Responsive design tested on mobile
- [ ] All links and navigation working
- [ ] API endpoints responding correctly
- [ ] Mock data loading properly
- [ ] Styling consistent across all pages

### Performance (Phase 8)
- [ ] Initial page load time < 3 seconds
- [ ] Route transitions < 500ms
- [ ] API responses < 1 second
- [ ] Bundle size acceptable
- [ ] No memory leaks detected
- [ ] Lighthouse score > 80

### Testing (Phase 8)
- [ ] Unit tests passing (if any)
- [ ] E2E tests created for critical flows
- [ ] Navigation tested between all sections
- [ ] Business page integrations tested
- [ ] Agent page functionality verified
- [ ] Error scenarios handled

### Documentation (Phase 8)
- [ ] IMPLEMENTATION_GUIDE.md complete
- [ ] API documentation updated
- [ ] Deployment procedures documented
- [ ] Team handoff notes created
- [ ] Known limitations documented

### Security
- [ ] No secrets in source code
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] HTTPS enabled on production
- [ ] CORS properly configured
- [ ] Database credentials secure

---

## STAGING DEPLOYMENT

### Objectives
Deploy to staging environment for final validation before production.

### Prerequisites
- Staging server available
- Staging database provisioned
- Environment variables configured
- DNS pointing to staging (optional)

### Deployment Steps

#### 1. Prepare Staging Environment

```bash
# SSH into staging server
ssh staging-server

# Create deployment directory
mkdir -p /var/www/pretzel-dashboard
cd /var/www/pretzel-dashboard

# Clone repository
git clone <repo-url> .
git checkout main

# Copy .env to staging
# (Get from secure storage, NOT from version control)
cp /secure/storage/.env.staging .env
```

#### 2. Deploy Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Or use gunicorn for production-like environment
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app
```

#### 3. Deploy Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Build Next.js app
npm run build

# Start Next.js server
npm start

# Or deploy to Vercel/Netlify
vercel deploy --prod
```

#### 4. Verify Deployment

```bash
# Test backend
curl http://staging.example.com:8000/api/admin/agents/overview

# Test frontend
curl http://staging.example.com:3000

# Check logs
tail -f /var/log/app.log
```

### Post-Deployment Testing

#### Staging Validation Checklist
- [ ] Homepage loads without errors
- [ ] All navigation items visible
- [ ] Business pages load (analytics, marketing, sales, inbox, social, traffic)
- [ ] Agent pages load (agents, support, social, leads, training, settings, vault, etc.)
- [ ] API endpoints responding
- [ ] Mock data displaying correctly
- [ ] Real API integrations working (Gmail, Twitter, LinkedIn if configured)
- [ ] Sidebar navigation switching between sections
- [ ] Mobile responsive design working
- [ ] Dark theme applied consistently

#### Integration Testing on Staging
```bash
# Run E2E tests against staging
npm run test:e2e -- --url http://staging.example.com:3000

# Performance testing
npm run test:perf

# Load testing (if applicable)
npm run test:load
```

#### Manual Testing on Staging
1. Navigate through all business pages
2. Navigate through all agent pages
3. Test responsive design on phone/tablet
4. Verify all charts and visualizations
5. Test any interactive features
6. Check console for errors (F12)
7. Verify performance (Lighthouse)

### Staging Sign-off
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Performance acceptable
- [ ] All tests passing
- [ ] Team approval received

---

## PRODUCTION DEPLOYMENT

### Pre-Production Checklist

#### Data Backup
```bash
# Backup production database
pg_dump -h prod-db-host -U postgres pretzel_db > /backups/pretzel_db_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore -l /backups/pretzel_db_*.sql | head -20
```

#### Environment Verification
- [ ] Production database accessible
- [ ] All environment variables set
- [ ] API keys configured
- [ ] Secrets stored securely
- [ ] SSL certificates valid
- [ ] CORS configured correctly

#### Team Notification
- [ ] Notify development team
- [ ] Notify operations team
- [ ] Notify users if needed
- [ ] Prepare rollback plan

### Deployment Execution

#### Step 1: Database Migrations
```bash
# On production server
cd backend

# Activate environment
source venv/bin/activate

# Run migrations
python -m alembic upgrade head

# Verify schema
psql -h prod-db-host -U postgres pretzel_db -c "\dt"
```

#### Step 2: Backend Deployment
```bash
# Pull latest code
git pull origin main

# Install dependencies (if any new)
pip install -r requirements.txt

# Restart FastAPI server
systemctl restart pretzel-backend

# Verify backend is running
curl http://localhost:8000/api/admin/agents/overview
```

#### Step 3: Frontend Deployment
```bash
# Build new version
npm run build

# Deploy to production (using your deployment method)
vercel deploy --prod

# Or update deployed instance
systemctl restart pretzel-frontend

# Verify frontend is running
curl http://localhost:3000
```

#### Step 4: Health Check
```bash
# Check backend health
curl -f http://example.com:8000/api/admin/agents/overview || exit 1

# Check frontend health
curl -f http://example.com:3000 || exit 1

# Check database connection
psql -h prod-db-host -U postgres -c "SELECT version();"

# Monitor logs
tail -f /var/log/pretzel/app.log
```

### Post-Production Validation

#### Immediate Checks (First 5 minutes)
- [ ] Frontend loads at example.com
- [ ] No console errors in browser
- [ ] Business pages accessible
- [ ] Agent pages accessible
- [ ] API endpoints responding
- [ ] Database queries working
- [ ] Error tracking activated
- [ ] Monitoring alerts active

#### Functional Validation (Next 30 minutes)
- [ ] Navigate through all business pages
- [ ] Check all widgets loading
- [ ] Verify API data displaying
- [ ] Test real integrations (Gmail, Twitter, LinkedIn)
- [ ] Check all charts rendering
- [ ] Verify responsive design
- [ ] Test error scenarios

#### Performance Validation
- [ ] Page load times acceptable
- [ ] API response times normal
- [ ] Server CPU/memory within limits
- [ ] Database queries performing
- [ ] No memory leaks observed

---

## MONITORING & ROLLBACK

### Monitoring Setup

#### Error Tracking
```bash
# Ensure error tracking configured
# (Sentry, LogRocket, or similar)

# Check error logs
tail -f /var/log/pretzel/errors.log
```

#### Performance Monitoring
```bash
# Monitor API response times
watch -n 5 'curl -s -o /dev/null -w "%{time_total}\n" http://example.com/api/admin/agents/overview'

# Monitor server resources
watch 'free -h; echo "---"; df -h; echo "---"; top -bn1 | head -20'
```

#### User Monitoring
- Monitor user sessions
- Track page views
- Monitor error rates
- Track API usage
- Monitor database performance

### Rollback Procedure

#### If Critical Issues Detected

**Decision Point**: Is the issue critical?
- Issues affecting core business operations: YES
- Issues affecting only agents: Maybe (decide based on impact)
- Minor UI glitches: NO

#### Rollback Steps

```bash
# Stop current version
systemctl stop pretzel-backend
systemctl stop pretzel-frontend

# Restore database to pre-deployment backup
# WARNING: This will lose any data since deployment
pg_restore -h prod-db-host -U postgres -d pretzel_db /backups/pretzel_db_BEFORE.sql

# Revert code to previous version
git checkout HEAD~1
git push origin main --force  # Only if absolutely necessary

# Restart with previous version
systemctl start pretzel-backend
systemctl start pretzel-frontend

# Verify rollback
curl -f http://example.com:3000 || echo "Rollback failed"

# Notify team
# Send rollback notification to team
```

#### Rollback Checklist
- [ ] Issue severity assessed
- [ ] Team decision made
- [ ] Database backed up (if not already)
- [ ] Previous version identified
- [ ] Rollback procedure documented
- [ ] Database restored
- [ ] Code reverted
- [ ] Services restarted
- [ ] Health checks passed
- [ ] Users notified

---

## POST-DEPLOYMENT VALIDATION

### Phase 9: Staging Sign-off
After staging deployment, verify:
- [ ] All 16 pages load correctly
- [ ] No console errors
- [ ] All navigation working
- [ ] API integrations functional
- [ ] Database queries successful
- [ ] Performance acceptable
- [ ] Responsive design verified
- [ ] Styling consistent
- [ ] Team approval documented

### Phase 10: Production Monitoring
After production deployment, monitor:
- [ ] Error rate < 0.1%
- [ ] Page load time < 3s
- [ ] API response time < 1s
- [ ] Database uptime > 99.9%
- [ ] User satisfaction feedback
- [ ] Performance metrics stable

### Lessons Learned Document

After deployment is stable (24+ hours), create a lessons learned document:

```markdown
# Deployment Lessons Learned - May 9, 2026

## What Went Well
- 

## What Could Be Improved
- 

## Issues Encountered
- Issue: 
  - Impact: 
  - Resolution: 
  - Prevention: 

## Recommendations for Next Deployment
- 

## Metrics
- Deployment time: X minutes
- Rollback time: X minutes (if needed)
- Downtime: X minutes
- Error rate: X%
```

---

## DEPLOYMENT TIMELINE

### Recommended Schedule

**Phase 9: Staging (Day 1-2)**
- Deploy to staging
- Run full integration tests
- Performance testing
- Team validation
- Fix any issues found
- Staging sign-off

**Phase 10: Production (Day 3)**
- Back up production database
- Deploy code and migrations
- Run health checks
- Monitor for 24+ hours
- Document lessons learned
- Announce to users

### Estimated Durations
- Backend deployment: 10-15 minutes
- Frontend deployment: 5-10 minutes
- Health checks: 5 minutes
- Full validation: 30-60 minutes

---

## TEAM RESPONSIBILITIES

### DevOps Team
- Provision and configure servers
- Set up monitoring
- Execute deployments
- Monitor logs
- Execute rollback if needed

### Backend Team
- Run database migrations
- Verify API endpoints
- Check database connections
- Monitor performance
- Be on-call for issues

### Frontend Team
- Build and test frontend
- Verify all pages load
- Check responsive design
- Verify styling
- Be on-call for UI issues

### QA Team
- Execute integration tests
- Perform user acceptance testing
- Verify all features working
- Document test results
- Sign off on deployment

---

## COMMUNICATION TEMPLATE

### Pre-Deployment Announcement
```
Subject: Scheduled Deployment - Pretzel Dashboard Upgrade

Team,

We have a scheduled deployment planned for [DATE] at [TIME].

What's changing:
- Agent Dashboard integration
- 10 new agent management pages
- Business page enhancements
- Performance improvements

Expected duration: 30-60 minutes
Expected downtime: None (zero-downtime deployment)

If you encounter any issues, please:
1. Take a screenshot
2. Note the time
3. Contact the on-call engineer

Thank you for your patience!
```

### Post-Deployment Announcement
```
Subject: Deployment Complete - Pretzel Dashboard Upgrade

Team,

The deployment completed successfully at [TIME].

What's new:
- Agent Dashboard integrated
- 10 new agent management pages
- Business pages enhanced
- Performance improved

No user action required. All existing functionality preserved.

Questions? Contact the team.
```

---

**END OF DEPLOYMENT GUIDE**
