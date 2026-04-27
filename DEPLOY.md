# DukanDiary Deployment Guide

Complete production deployment guide for DukanDiary textile retail management system.

## 📋 Prerequisites

Before starting deployment, ensure you have:
- Supabase account (https://supabase.com)
- Railway account (https://railway.app) for backend
- Vercel account (https://vercel.com) for frontend
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js v18+ installed locally

---

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Organization:** Your organization
   - **Project name:** `dukandiary-prod`
   - **Database password:** Create secure password (save this!)
   - **Region:** Select closest to your users
4. Click "Create new project"
5. Wait for project to initialize (2-3 minutes)

### 1.2 Deploy Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `schema.sql` from root folder
4. Paste into the query editor
5. Click **"RUN"**
6. Wait for schema to deploy (should show success message)

### 1.3 Verify Database

1. Go to **Table Editor**
2. Verify these tables exist:
   - `vendors`
   - `stock_entries`
   - `expenses`
   - `cheques`
   - `sales`
   - `settings`
3. Click on `settings` table
4. Verify seed data exists:
   - `default_pin: 1234`
   - `default_email_recipient: owner@dukandiary.com`
   - `business_name: My Textile Shop`
   - `expense_categories: [comma-separated list]`

### 1.4 Get Supabase Credentials

1. Go to **Project Settings** (bottom left)
2. Click **"API"** in left menu
3. Copy and save these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** `eyJhbGc...` (long string)
   - **Service Role Key:** (also available, for backend only)

⚠️ **IMPORTANT:** Keep these credentials secure! Never commit them to git.

---

## 🚀 Step 2: Backend Deployment (Railway)

### 2.1 Create Railway Project

1. Go to https://railway.app
2. Click **"Create a new project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway with your GitHub account
5. Select your DukanDiary repository
6. Select `backend` as the service

### 2.2 Configure Environment Variables

1. In Railway, click on the backend service
2. Go to **"Variables"** tab
3. Add these environment variables (see Step 6 for all variables):

**Required Variables:**
```
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
RESEND_API_KEY=re_xxxxx...
CORS_ORIGIN=https://your-frontend-url.vercel.app
DEFAULT_EMAIL_RECIPIENT=your-email@example.com
```

4. Click **"Save"** for each variable

### 2.3 Deploy Backend

1. Railway automatically detects changes and deploys
2. Watch the **"Deployments"** tab
3. Wait for status to show **"Deployed"** (green checkmark)
4. Get the Railway backend URL:
   - Go to **"Settings"** tab
   - Look for **"Domains"**
   - Copy the URL (format: `https://dukandiary-prod-api.railway.app`)

### 2.4 Verify Backend

```bash
curl https://your-railway-url/health
# Should return: { "status": "ok", "timestamp": "..." }
```

---

## 💻 Step 3: Frontend Deployment (Vercel)

### 3.1 Connect Repository

1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your Git repository
4. Select `frontend` as the root directory
5. Vercel auto-detects Vite configuration

### 3.2 Configure Environment Variables

1. In Vercel project settings, go to **"Environment Variables"**
2. Add this variable:

```
VITE_API_BASE_URL=https://your-railway-url/api
```

Example:
```
VITE_API_BASE_URL=https://dukandiary-prod-api.railway.app/api
```

3. Click **"Save and Deploy"**

### 3.3 Deploy Frontend

1. Vercel automatically starts deployment
2. Watch the **"Deployments"** section
3. Wait for status to show **"Ready"** (blue checkmark)
4. Get your frontend URL:
   - Format: `https://dukandiary-prod.vercel.app`
   - Or your custom domain if configured

### 3.4 Verify Frontend

1. Open frontend URL in browser
2. Should see login screen
3. Try logging in with PIN: `1234`
4. Verify dashboard loads

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update Backend CORS

Now that you have your Vercel frontend URL:

1. Go back to **Railway** backend settings
2. Edit **`CORS_ORIGIN`** variable
3. Set to your Vercel URL: `https://dukandiary-prod.vercel.app`
4. Save and redeploy

### 4.2 Update Frontend API URL (if needed)

If you used a placeholder:

1. Go to **Vercel** frontend settings
2. Edit **`VITE_API_BASE_URL`** variable
3. Set to your Railway backend URL: `https://your-railway-url/api`
4. Trigger redeploy

### 4.3 Test Integration

1. Open frontend in browser
2. Login with PIN: `1234`
3. Add a stock entry and verify it saves
4. Check network tab to see API calls going to Railway backend

---

## 📧 Step 5: Email Configuration (Resend)

### 5.1 Create Resend Account

1. Go to https://resend.com
2. Sign up for free account
3. Verify your email

### 5.2 Get API Key

1. Go to **"API Keys"** section
2. Click **"Create API Key"**
3. Name it: `dukandiary-prod`
4. Copy the key (format: `re_xxxxx...`)

### 5.3 Configure Email

1. Go to **"From Addresses"**
2. Click **"Create"**
3. Add sender email:
   - **Name:** `DukanDiary`
   - **Email:** `noreply@yourdomain.com` or use Resend subdomain
4. Click **"Create"**
5. Verify the email (check inbox)

### 5.4 Update Backend

1. Go to **Railway** backend settings
2. Update **`RESEND_API_KEY`** with your key
3. Update **`DEFAULT_EMAIL_RECIPIENT`** with your business email
4. Redeploy

### 5.5 Test Email

1. Login to frontend
2. Go to Settings
3. Email should be configured
4. (Optional) Check email logs in Resend dashboard

---

## 🔐 Security Checklist

Before going live, verify:

### Backend Security
- [x] `NODE_ENV=production` set
- [x] `CORS_ORIGIN` points to frontend only
- [x] `SUPABASE_KEY` is anon key (not service role)
- [x] All secrets stored in Railway (not in git)
- [x] HTTPS enforced (Vercel/Railway handle this)
- [x] Health check endpoint responds (`/health`)

### Frontend Security
- [x] `VITE_API_BASE_URL` points to production backend
- [x] No hardcoded secrets in code
- [x] Environment variables used for all configs
- [x] SPA routing configured (vercel.json)

### Database Security
- [x] Supabase Row Level Security enabled
- [x] Database backups enabled (Supabase default)
- [x] Strong password set for database
- [x] Access restricted to verified IPs (optional)

### General
- [x] Custom domain configured (optional but recommended)
- [x] SSL/TLS enabled (automatic on Vercel/Railway)
- [x] Monitoring configured (optional)
- [x] Backups scheduled (Supabase automatic)

---

## 📊 All Environment Variables Reference

### Frontend (Vercel)

| Variable | Value | Where to Find | Required |
|----------|-------|---------------|----------|
| `VITE_API_BASE_URL` | `https://your-backend.railway.app/api` | Railway project URL | ✅ Yes |
| `VITE_APP_ENV` | `production` | Set manually | ❌ No |
| `VITE_APP_NAME` | `DukanDiary` | Set manually | ❌ No |
| `VITE_APP_VERSION` | `1.0.0` | Set manually | ❌ No |

**Get `VITE_API_BASE_URL`:**
1. Go to Railway project
2. Click backend service
3. Go to Settings → Domains
4. Copy domain + add `/api`
5. Example: `https://dukandiary-prod-api.railway.app/api`

---

### Backend (Railway)

| Variable | Value | Where to Find | Required | Example |
|----------|-------|---------------|----------|---------|
| `PORT` | `3000` | Set manually | ✅ Yes | `3000` |
| `NODE_ENV` | `production` | Set manually | ✅ Yes | `production` |
| `SUPABASE_URL` | Project URL | Supabase → Settings → API | ✅ Yes | `https://xxxx.supabase.co` |
| `SUPABASE_KEY` | Anon Key | Supabase → Settings → API | ✅ Yes | `eyJhbGc...` |
| `RESEND_API_KEY` | API Key | Resend → API Keys | ✅ Yes | `re_xxxxx...` |
| `CORS_ORIGIN` | Frontend URL | Vercel project URL | ✅ Yes | `https://dukandiary.vercel.app` |
| `DEFAULT_EMAIL_RECIPIENT` | Your email | Set manually | ✅ Yes | `owner@company.com` |
| `APP_NAME` | `DukanDiary` | Set manually | ❌ No | `DukanDiary` |
| `APP_VERSION` | `1.0.0` | Set manually | ❌ No | `1.0.0` |
| `LOG_LEVEL` | `info` | Set manually | ❌ No | `info` |

**Get Each Backend Variable:**

**`SUPABASE_URL`:**
1. Go to Supabase → Project Settings
2. Click "API" in left menu
3. Under "Project URL" → Copy the URL
4. Example: `https://xxxxxxxx.supabase.co`

**`SUPABASE_KEY`:**
1. Same location as SUPABASE_URL
2. Under "Project API keys"
3. Copy the "Anon" key (public key, not service role)
4. Example: `eyJhbGciOiJIUzI1NiIsInR5c...` (long string)

**`RESEND_API_KEY`:**
1. Go to Resend.com
2. Login to your account
3. Go to "API Keys"
4. Copy your API key
5. Format: `re_xxxxxxxx...`

**`CORS_ORIGIN`:**
1. Go to Vercel project
2. Copy the deployment URL
3. Example: `https://dukandiary-prod.vercel.app`
4. ⚠️ Important: Don't include `/api` here

**`DEFAULT_EMAIL_RECIPIENT`:**
1. Use your business email address
2. Where daily digest emails will be sent
3. Example: `owner@dukandiary.com`

---

## 🧪 Post-Deployment Testing

### Quick Smoke Test

```bash
# 1. Frontend loads
curl https://your-frontend-url.vercel.app

# 2. Backend health check
curl https://your-backend.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}

# 3. API connection
curl https://your-backend.railway.app/api/vendors
# Should return: {"success":true,"data":[...],"count":0}
```

### In Browser

```
1. Login Page
   - Open https://your-frontend-url.vercel.app/login
   - Enter PIN: 1234
   - Should redirect to dashboard

2. Dashboard
   - Verify 4 summary cards load
   - Check Network tab for API calls

3. Add Stock Entry
   - Go to Stock tab
   - Add new entry
   - Verify success toast
   - Check Network tab shows POST to backend

4. Generate Report
   - Go to More → Reports
   - Generate Stock Register
   - Download as Excel
   - Verify file downloads

5. File Upload
   - Go to Sales
   - Toggle to File Upload
   - Upload sample Excel
   - Verify preview shows data
   - Complete import
```

---

## 🆘 Troubleshooting

### Frontend Won't Load

**Issue:** Vercel shows "Build failed"
**Solution:**
1. Check build logs in Vercel
2. Verify `npm run build` works locally
3. Check for TypeScript errors: `npm run build`
4. Ensure all dependencies in package.json

**Issue:** Shows blank page or 404
**Solution:**
1. Clear browser cache (Cmd+Shift+Del)
2. Hard refresh (Cmd+Shift+R)
3. Check vercel.json exists and has rewrites
4. Check VITE_API_BASE_URL is set

### Backend Won't Deploy

**Issue:** Railway shows "Build failed"
**Solution:**
1. Check Railway build logs
2. Verify `npm install` works locally
3. Check Node.js version: should be v18+
4. Ensure Procfile or railway.toml exists

**Issue:** Backend starts but crashes
**Solution:**
1. Check Railway logs for error messages
2. Verify all env variables are set
3. Test database connection:
   ```bash
   curl https://your-backend/health
   ```
4. Check Supabase is accessible

### API Connection Issues

**Issue:** Frontend gets "Network Error" when calling API
**Solution:**
1. Check VITE_API_BASE_URL in Vercel
2. Verify CORS_ORIGIN in Railway
3. Check browser console for actual error
4. Try API directly: `curl https://backend-url/api/vendors`
5. Check Network tab to see actual request/response

**Issue:** API returns 403 Forbidden
**Solution:**
1. Verify CORS_ORIGIN exactly matches frontend URL
2. Try from different domain to test CORS
3. Check backend is running: `/health` endpoint
4. Verify no typos in URLs

### Database Connection Issues

**Issue:** Backend can't connect to Supabase
**Solution:**
1. Verify SUPABASE_URL is correct
2. Verify SUPABASE_KEY is correct (anon key, not service role)
3. Test URL directly in browser
4. Check Supabase project is active
5. Verify database isn't paused

---

## 📈 Production Best Practices

### Monitoring

1. **Railway:**
   - Enable "Alerts" for failures
   - Monitor CPU/Memory usage
   - Check logs regularly
   - Set up Slack notifications (optional)

2. **Vercel:**
   - Monitor build performance
   - Set up email alerts
   - Check Analytics dashboard

3. **Supabase:**
   - Monitor database connections
   - Check query performance
   - Review audit logs

### Maintenance

1. **Weekly:**
   - Check backend logs for errors
   - Verify all features working
   - Monitor email sending

2. **Monthly:**
   - Review error patterns
   - Update dependencies (security)
   - Backup data manually (Supabase auto-backs up)

3. **Quarterly:**
   - Performance review
   - Cost optimization
   - Security audit

### Backups

- **Database:** Supabase automatic (daily)
- **Code:** Git repository (always)
- **Files:** Vercel auto-archives old deployments
- **Email:** Resend keeps 30-day log

---

## 🎯 Rollback Plan

If something goes wrong in production:

### Quick Rollback (Frontend)

1. Go to Vercel → Deployments
2. Find previous working deployment (green checkmark)
3. Click "Redeploy"
4. Takes 1-2 minutes

### Database Rollback

1. Supabase keeps backups automatically
2. Contact Supabase support if data corruption
3. Don't manually delete data without backup

### Backend Rollback

1. Go to Railway → Deployments
2. Find previous successful deployment
3. Click "Redeploy"
4. Takes 2-3 minutes

---

## 📞 Support & Escalation

| Issue | First Step | Escalate To |
|-------|-----------|------------|
| Frontend not loading | Check Vercel logs | Vercel Support |
| Backend not responding | Check Railway logs | Railway Support |
| Database issues | Check Supabase dashboard | Supabase Support |
| Email not sending | Check Resend logs | Resend Support |
| API connection | Check CORS settings | Backend logs |

---

## ✅ Deployment Checklist

Before launching to production:

### Pre-Deployment (Local)
- [ ] `npm run build` succeeds locally
- [ ] No console errors in browser DevTools
- [ ] All tests pass
- [ ] `.env` files not committed to git
- [ ] Latest code pushed to main branch

### Supabase Setup
- [ ] Account created
- [ ] Project created
- [ ] schema.sql deployed successfully
- [ ] Seed data verified in settings table
- [ ] Credentials copied and saved

### Backend (Railway)
- [ ] Project created
- [ ] All 8 environment variables set
- [ ] Deployment shows "Deployed" status
- [ ] Health check endpoint works
- [ ] Logs show no errors

### Frontend (Vercel)
- [ ] Project created
- [ ] Build succeeds
- [ ] Deployment shows "Ready" status
- [ ] Environment variables set
- [ ] Can access login page

### Integration
- [ ] CORS_ORIGIN updated in Railway
- [ ] VITE_API_BASE_URL updated in Vercel
- [ ] Frontend can call backend APIs
- [ ] Login works with PIN
- [ ] Dashboard loads data

### Security
- [ ] NODE_ENV=production
- [ ] No secrets in code
- [ ] HTTPS enabled (automatic)
- [ ] CORS restricted to frontend
- [ ] Database backups enabled

### Testing
- [ ] Login works
- [ ] Add stock entry works
- [ ] Add expense works
- [ ] Report generation works
- [ ] File upload works
- [ ] Email sending configured

---

## 🎉 Going Live

### Final Steps

1. **Monitor the first hour**
   - Watch error logs
   - Test key features
   - Monitor response times

2. **Announce to users**
   - Share frontend URL
   - Provide login PIN
   - Share documentation link

3. **Post-launch**
   - Collect user feedback
   - Monitor performance
   - Fix any issues quickly

---

## 📚 Documentation Links

- **Supabase Docs:** https://supabase.com/docs
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Resend Docs:** https://resend.com/docs
- **Node.js:** https://nodejs.org

---

## 🚀 You're Ready!

Your DukanDiary application is now production-ready. Follow these steps and you'll have a fully functional textile retail management system live on the internet.

**Expected Timeline:**
- Supabase setup: 5 minutes
- Backend deployment: 10 minutes
- Frontend deployment: 5 minutes
- Testing & verification: 10 minutes
- **Total: ~30 minutes**

Good luck with your launch! 🧵

---

**Last Updated:** Production Ready
**Version:** 1.0.0
**Status:** ✅ Ready to Deploy
