# Google OAuth Setup

Google login is optional. If GOOGLE_CLIENT_ID is empty, the Google button does
not appear and credentials login still works.

## 1. Create a Google Cloud project

1. Go to https://console.cloud.google.com/
2. Top bar -> project dropdown -> New project -> name it "J&R Ecommerce" -> Create
3. Switch to the new project

## 2. Configure OAuth consent screen

1. Left menu -> APIs & Services -> OAuth consent screen
2. User type: External -> Create
3. App name: J&R Ecommerce
4. User support email: your email
5. Developer contact email: your email
6. Save and continue through Scopes (no scopes needed)
7. Test users: add your own Gmail for testing
8. Save

## 3. Create OAuth credentials

1. APIs & Services -> Credentials -> Create credentials -> OAuth client ID
2. Application type: Web application
3. Name: J&R Ecommerce web
4. Authorized JavaScript origins:
   - http://localhost:3000 (dev)
   - https://your-domain.example (prod, later)
5. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (dev)
   - https://your-domain.example/api/auth/callback/google (prod, later)
6. Create -> copy the Client ID and Client secret

## 4. Add to .env.local and .env

GOOGLE_CLIENT_ID="1234567890-xxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxx"

## 5. Set AUTH_SECRET

Generate a random secret once:

[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))

Then in .env and .env.local:

AUTH_SECRET="<paste the base64 string>"

## 6. Restart the dev server

npm run dev

The "Continue with Google" button will now appear on /login.

## Account linking behaviour

- Google sign-in with a verified email matching an existing credentials user
  will link to that user (one account, either login method).
- Google sign-in with an unverified email will create a new user.
- Never creates a duplicate account for the same email.