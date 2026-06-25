# Admin And Test User Workflow

## Goal

Give the team a safe, repeatable way to:

- create normal test users for local or shared `dev` environments
- elevate approved accounts to `admin`
- test `user`, `content_editor`, and `admin` behavior without exposing role changes through the normal app UI

## Safety Boundary

- normal runtime flows do not expose profile role assignment
- role changes use the Supabase service-role key through local scripts only
- `admin` grants are blocked unless the target email is present in `ADMIN_ALLOWLIST_EMAILS`
- test users created through the script always start as `user`

This keeps the dangerous path outside regular product flows and makes admin elevation an explicit operator action.

## Required Environment

Add these values to your local `.env` when you need admin tooling:

- `PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWLIST_EMAILS`

Example:

```env
ADMIN_ALLOWLIST_EMAILS=lead@example.com,ops@example.com
```

Keep the allowlist short and intentional. Do not use wildcards, shared inboxes, or broad team aliases.

## Create A Normal Test User

Run:

```bash
node --experimental-strip-types scripts/create-test-user.ts --email tester@example.com --password secret123 --display-name "QA Tester"
```

Notes:

- the script creates the Supabase Auth user
- it upserts a matching `profiles` row
- the resulting `profiles.global_role` is always `user`
- `--email-confirmed` defaults to `true` and can be set to `false` if you want to test confirmation behavior

## Grant Or Change A Role

Run:

```bash
node --experimental-strip-types scripts/manage-user-role.ts --email lead@example.com --role admin
```

Supported roles:

- `user`
- `content_editor`
- `admin`

Rules:

- the target account must already exist in Supabase Auth
- `admin` grants fail unless the email is in `ADMIN_ALLOWLIST_EMAILS`
- `content_editor` and `user` updates do not require the admin allowlist

## Recommended Team Workflow

1. Use `/auth/register` for real day-to-day developer accounts, or `scripts/create-test-user.ts` for disposable test accounts.
2. Keep most accounts at `user`.
3. Promote only explicitly approved emails to `admin` with `scripts/manage-user-role.ts`.
4. Use `content_editor` for permission testing that does not require full admin power.
5. Remove an elevated account by setting it back to `user` when the test is over.

## Verification

After creating or updating a user:

1. sign in with that account
2. open `/app`
3. confirm the role shown in the app shell matches the intended permission level

## Scope

This workflow is intentionally operational, not end-user facing. If the app later gains a real admin console, it should preserve the same boundary: explicit server-side authorization plus a narrow set of approved admins.
