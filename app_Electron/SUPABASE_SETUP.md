# Supabase Edge Function Deployment

## Deploy signup-auto function to Supabase

The Edge Function handles auto-signup when users want to upload to cloud.

### Option 1: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
```bash
npm install -g supabase
```

2. **Login to Supabase**:
```bash
supabase login
```

3. **Link your project**:
```bash
cd app_Electron
supabase link --project-ref jkrgyycposcdizfyhvwv
```

4. **Deploy the function**:
```bash
supabase functions deploy signup-auto
```

5. **Verify deployment**:
The function will be available at:
```
https://jkrgyycposcdizfyhvwv.supabase.co/functions/v1/signup-auto
```

### Option 2: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project → **Edge Functions**
3. Click **Create a new function**
4. Name it: `signup-auto`
5. Copy the code from `supabase/functions/signup-auto/index.ts`
6. Click **Deploy**

---

## How It Works

1. **App calls** `signupAutoWithEmail(email)` from `src/utils/auth.js`
2. **Edge Function** creates user with auto-generated password
3. **User is auto-logged in** and can upload to cloud
4. **Password** is shown to user (they should save it)

---

## Testing

You can test the function locally:

```bash
supabase functions serve signup-auto
```

Then call it:
```bash
curl -X POST http://localhost:54321/functions/v1/signup-auto \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
```json
{
  "userId": "...",
  "email": "test@example.com",
  "password": "..."
}
```
