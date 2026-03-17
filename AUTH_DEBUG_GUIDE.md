# Authentication Debugging Guide

## Quick Diagnosis Checklist

### 1. Check Browser Console
- [ ] Look for `AuthSessionMissingError` or other auth errors
- [ ] Verify `useSupabaseUser.ts` line numbers match updated code
- [ ] Check for network errors (CORS, 404, etc.)

### 2. Verify Environment Setup
```bash
# Check if .env.local exists
ls -la .env.local

# Expected content:
# VITE_SUPABASE_URL=https://lzjhjecktllltkizgwnr.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3. Check Browser Storage
Open DevTools → Application → LocalStorage:
- Look for key: `sb-lzjhjecktllltkizgwnr-auth-token`
- If present: Session exists
- If missing: No session (expected for new users)

### 4. Verify Network Requests
DevTools → Network tab:
```
✅ Expected requests:
   - https://lzjhjecktllltkizgwnr.supabase.co/rest/v1/...
   - https://lzjhjecktllltkizgwnr.supabase.co/auth/v1/...

❌ Requests to avoid:
   - 404 errors
   - CORS errors
   - Failed image loads from translate.googleapis.com (safe to ignore)
```

## Common Error Messages

### 1. "AuthSessionMissingError: Auth session missing!"
**Cause**: User not logged in, calling getUser() without session
**Fix**: ✅ Already fixed in updated useSupabaseUser.ts

### 2. "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT"
**Cause**: Browser extension (ad blocker) blocking translate.googleapis.com
**Fix**: 
```typescript
// Safe to ignore - doesn't affect authentication
// Can disable extensions for testing if needed
```

### 3. "Supabase environment variables are missing"
**Cause**: .env.local file not found or not loaded
**Fix**: 
```bash
# 1. Create .env.local
cp .env.local.example .env.local

# 2. Add your credentials
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here

# 3. Restart dev server (very important!)
npm run dev
```

### 4. "CORS error when accessing Supabase"
**Cause**: Supabase URL not in allowed redirect URLs
**Fix**:
```
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add: http://localhost:5173 (dev)
4. Add: http://localhost:3000 (alternative)
5. Save and retry
```

## Testing Auth Flow

### Test 1: Anonymous Access
```typescript
// Scenario: User hasn't logged in
1. Start app in private window
2. Navigate to homepage
3. useSupabaseUser hook should:
   - Call getSession() safely
   - Return { user: null, loading: false }
   - NOT throw error
4. App should display login button
```

### Test 2: Login Flow
```typescript
// Scenario: User logs in
1. Go to /login page
2. Enter test@example.com / TestPassword123!
3. Click Sign In
4. useSupabaseUser hook should:
   - Detect session change
   - Update user state
   - Persist to localStorage
5. Should redirect to dashboard/profile
```

### Test 3: Session Persistence
```typescript
// Scenario: User refreshes page
1. Login (from Test 2)
2. F5 / Refresh page
3. useSupabaseUser hook should:
   - Call getSession() on mount
   - Restore user from localStorage
   - Display user info immediately
   - Loading state: false → true → false
```

### Test 4: Logout Flow
```typescript
// Scenario: User logs out
1. While logged in, click Logout
2. signOut() function should:
   - Call supabase.auth.signOut()
   - Clear localStorage token
   - Set user to null
3. Should redirect to login page
```

## Debug Mode Enablement

### Increase Logging
Edit `src/lib/useSupabaseUser.ts`:

```typescript
// Change from:
console.debug('No active session found');

// To:
console.log('Auth Debug:', {
  event: 'no_session',
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
});
```

### Add Debug Overlay
Create a temporary debug component:

```typescript
// src/components/AuthDebug.tsx
export function AuthDebug() {
  const { user, loading } = useSupabaseUser();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 text-xs rounded">
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>User ID: {user?.id || 'none'}</p>
      <p>Email: {user?.email || 'none'}</p>
    </div>
  );
}

// Add to App.tsx during debugging:
<AuthDebug />
```

## Network Traffic Analysis

### Expected Supabase Requests

**On App Load:**
```
GET /auth/v1/session
  ↓
200 OK (if session exists) or null (if no session)

POST /auth/v1/...
  ↓
Session token refresh (if needed)
```

**On Login:**
```
POST /auth/v1/token?grant_type=password
  ↓
200 OK + refresh_token + access_token
  ↓
localStorage updated
```

**On Logout:**
```
POST /auth/v1/logout
  ↓
200 OK
  ↓
localStorage cleared
```

## Performance Metrics

### Expected Timings
```
useSupabaseUser initialization:
- getSession() call: 100-300ms (depends on network)
- localStorage read: 1-5ms
- Total time to loading=false: 100-400ms

Login request:
- POST /auth/v1/token: 200-500ms
- State update: <10ms
- Total login time: 200-600ms
```

### Slow Auth Performance
If auth is slow:
1. Check network tab for timeouts
2. Verify Supabase project status
3. Check for rate limiting (too many failed login attempts)
4. Verify database connectivity

## Production Checklist

Before deploying:
- [ ] Environment variables set in production
- [ ] Supabase project configured for production URL
- [ ] Redirect URLs include production domain
- [ ] SSL/TLS certificate valid
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] Error logging enabled
- [ ] Session timeout configured
- [ ] MFA considered for admin users
- [ ] Audit logs enabled

## Support Resources

### Supabase Documentation
- [Auth Overview](https://supabase.com/docs/guides/auth)
- [Troubleshooting](https://supabase.com/docs/guides/auth/troubleshooting)
- [API Reference](https://supabase.com/docs/reference/javascript/auth-getsession)

### GitHub Issues
- Check nwdi repo issues for similar problems
- Search closed issues before opening new ones

### Community Help
- Supabase Discord: https://discord.supabase.io
- NWDI Project Discussions: GitHub Discussions tab

## Quick Reset

If everything is broken, start fresh:

```bash
# 1. Clear browser storage
# DevTools → Application → Clear site data

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
rm -rf node_modules
npm install

# 4. Verify environment
cat .env.local

# 5. Restart dev server
npm run dev
```

## Contact & Escalation

If issues persist:
1. Collect error logs (copy console errors)
2. Note exact steps to reproduce
3. Check DevTools Network tab for failures
4. Post to GitHub Issues with:
   - Error message
   - Steps to reproduce
   - Environment (OS, browser, Node version)
   - Network tab screenshot
