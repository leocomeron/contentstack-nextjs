# Deployment Guide

## Table of Contents
- [Contentstack Launch](#contentstack-launch)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables for Deployment](#environment-variables-for-deployment)
- [Regional API Hosts](#regional-api-hosts)
- [Content Seeding with CLI](#content-seeding-with-cli)
- [Common Issues](#common-issues)

## Contentstack Launch

Contentstack Launch is the built-in deployment platform.

### Steps:
1. Log into Contentstack → navigate to Launch from left sidebar
2. Click "+ New Project" → "Import from a Git Repository"
3. Select GitHub and authorize access
4. Configure: select repository, branch (default: master/main), project name, environment
5. Build and output settings auto-populate for Next.js
6. Add environment variables (see below)
7. Click Deploy

Build logs are available under the Logs section. Redeployment supports selecting alternative commits.

**Access restriction**: Only Organization Admin/Owner can create Launch projects.

## Vercel Deployment

### Via Git Integration (Recommended):
1. Push code to GitHub/GitLab/Bitbucket
2. Import repository at vercel.com/new
3. Vercel auto-detects Next.js and applies correct build settings
4. Add all `CONTENTSTACK_*` environment variables
5. Click Deploy

### Build settings (auto-detected):
- Framework: Next.js
- Build command: `next build`
- Output directory: `.next`

## Environment Variables for Deployment

Set these on your deployment platform (Launch, Vercel, etc.):

### Required:
```
CONTENTSTACK_API_KEY=<stack_api_key>
CONTENTSTACK_DELIVERY_TOKEN=<delivery_token>
CONTENTSTACK_ENVIRONMENT=<environment_name>
```

### Live Preview (set if using preview mode):
```
CONTENTSTACK_PREVIEW_HOST=rest-preview.contentstack.com
CONTENTSTACK_PREVIEW_TOKEN=<preview_token>
CONTENTSTACK_APP_HOST=app.contentstack.com
CONTENTSTACK_LIVE_PREVIEW=true
CONTENTSTACK_LIVE_EDIT_TAGS=false
```

### Optional:
```
CONTENTSTACK_REGION=us
CONTENTSTACK_BRANCH=main
CONTENTSTACK_API_HOST=api.contentstack.io
NEXT_PUBLIC_HOSTED_URL=https://your-domain.com
```

**Best practice**: Create separate delivery tokens for development and production environments.

## Regional API Hosts

Set `CONTENTSTACK_API_HOST` based on your region:

| Region | API Host | Preview Host |
|---|---|---|
| NA (default) | `cdn.contentstack.io` | `rest-preview.contentstack.com` |
| EU | `eu-api.contentstack.com` | `eu-rest-preview.contentstack.com` |
| Azure NA | `azure-na-api.contentstack.com` | `azure-na-rest-preview.contentstack.com` |
| Azure EU | `azure-eu-api.contentstack.com` | `azure-eu-rest-preview.contentstack.com` |
| GCP NA | `gcp-na-api.contentstack.com` | `gcp-na-rest-preview.contentstack.com` |

## Content Seeding with CLI

To populate a stack with starter content:

```bash
# Install Contentstack CLI
npm install -g @contentstack/cli

# Set region
csdx config:set:region <NA|EU|AZURE-NA|AZURE-EU|GCP-NA>

# Login
csdx auth:login

# Seed content from starter repo
csdx cm:stacks:seed --repo "contentstack/stack-starter-app"
```

**SSO Note**: CLI auth doesn't support strict SSO. For strict SSO organizations, adjust SSO strict mode per-user in Organization Settings.

## Common Issues

### Live Preview not working
- Verify `CONTENTSTACK_LIVE_PREVIEW=true` (string, not boolean)
- Verify preview token matches the delivery token's environment
- Check `CONTENTSTACK_PREVIEW_HOST` matches your region
- Ensure `CONTENTSTACK_APP_HOST` is set

### 404 on pages that exist in Contentstack
- Verify the entry's `url` field matches the expected path (must start with `/`)
- Check the entry is published in the correct environment
- Verify `CONTENTSTACK_ENVIRONMENT` matches the publishing environment

### Missing content / empty references
- Ensure referenced entries (authors, related posts) are published
- Check `referenceFieldPath` includes the correct dot-notation path
- Verify `jsonRtePath` includes paths for all JSON RTE fields

### Region mismatch errors
- `CONTENTSTACK_REGION`, `CONTENTSTACK_API_HOST`, and `CONTENTSTACK_PREVIEW_HOST` must all match the same region
