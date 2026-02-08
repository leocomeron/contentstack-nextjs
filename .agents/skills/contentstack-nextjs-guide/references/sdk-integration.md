# Contentstack SDK Integration Patterns

## Table of Contents
- [SDK Initialization](#sdk-initialization)
- [Environment Variables](#environment-variables)
- [Fetching Entries](#fetching-entries)
- [Reference Field Resolution](#reference-field-resolution)
- [JSON RTE to HTML Conversion](#json-rte-to-html-conversion)
- [Live Preview Setup](#live-preview-setup)
- [Live Edit Tags](#live-edit-tags)
- [Region Configuration](#region-configuration)

## SDK Initialization

Initialize the Contentstack Stack instance once and reuse it. The SDK uses `contentstack` package (v3.x).

```typescript
import { Config, Region, LivePreview, Stack } from "contentstack";

const stackConfig: Config = {
  api_key: CONTENTSTACK_API_KEY,
  delivery_token: CONTENTSTACK_DELIVERY_TOKEN,
  environment: CONTENTSTACK_ENVIRONMENT,
  region: Region.US,          // Region enum from SDK
  branch: CONTENTSTACK_BRANCH || "main",
};

// Add live preview config only when enabled
if (CONTENTSTACK_LIVE_PREVIEW === "true") {
  stackConfig.live_preview = {
    preview_token: CONTENTSTACK_PREVIEW_TOKEN,
    enable: true,
    host: CONTENTSTACK_PREVIEW_HOST,
  } as LivePreview;
}

const StackInstance = Stack(stackConfig);
```

**Key pattern**: Environment config is accessed via `next/config` `publicRuntimeConfig` (client-side) or `process.env` (server-side). The pattern is:

```typescript
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const envConfig = process.env.CONTENTSTACK_API_KEY
  ? process.env
  : publicRuntimeConfig;
```

This dual-source pattern allows the SDK to work both server-side and client-side.

## Environment Variables

### Required
| Variable | Description |
|---|---|
| `CONTENTSTACK_API_KEY` | Stack API key |
| `CONTENTSTACK_DELIVERY_TOKEN` | Delivery token for the environment |
| `CONTENTSTACK_ENVIRONMENT` | Environment name (e.g., "development", "production") |

### Live Preview (required if LIVE_PREVIEW=true)
| Variable | Description |
|---|---|
| `CONTENTSTACK_PREVIEW_TOKEN` | Preview token linked to delivery token |
| `CONTENTSTACK_PREVIEW_HOST` | `rest-preview.contentstack.com` (US), `eu-rest-preview.contentstack.com` (EU) |
| `CONTENTSTACK_APP_HOST` | `app.contentstack.com` (US), `eu-app.contentstack.com` (EU) |
| `CONTENTSTACK_LIVE_PREVIEW` | `"true"` or `"false"` (string, not boolean) |
| `CONTENTSTACK_LIVE_EDIT_TAGS` | `"true"` or `"false"` — enables inline editing tags |

### Optional
| Variable | Default | Description |
|---|---|---|
| `CONTENTSTACK_REGION` | `"us"` | Region code: us, eu, azure-na, azure-eu, gcp-na |
| `CONTENTSTACK_BRANCH` | `"main"` | Content branch |
| `CONTENTSTACK_API_HOST` | `"api.contentstack.io"` | Custom API host |
| `NEXT_PUBLIC_HOSTED_URL` | `"http://localhost:3000"` | Used for sitemap generation |

**Critical**: All env vars are strings. `CONTENTSTACK_LIVE_PREVIEW` compares with `=== "true"`, not truthy/falsy.

## Fetching Entries

Two core functions handle all data fetching:

### getEntry — Fetch all entries of a content type

```typescript
type GetEntry = {
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
};

const getEntry = ({ contentTypeUid, referenceFieldPath, jsonRtePath }: GetEntry) => {
  const query = Stack.ContentType(contentTypeUid).Query();
  if (referenceFieldPath) query.includeReference(referenceFieldPath);
  return query.toJSON().find().then((result) => {
    if (jsonRtePath) {
      Utils.jsonToHTML({ entry: result, paths: jsonRtePath, renderOption });
    }
    return result;
  });
};
```

### getEntryByUrl — Fetch single entry by URL field

```typescript
type GetEntryByUrl = {
  entryUrl: string | undefined;
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
};

const getEntryByUrl = ({ contentTypeUid, entryUrl, referenceFieldPath, jsonRtePath }: GetEntryByUrl) => {
  const query = Stack.ContentType(contentTypeUid).Query();
  if (referenceFieldPath) query.includeReference(referenceFieldPath);
  return query.toJSON().where("url", entryUrl).find().then((result) => {
    if (jsonRtePath) {
      Utils.jsonToHTML({ entry: result, paths: jsonRtePath, renderOption });
    }
    return result[0]; // Returns first match (entries are arrays of arrays)
  });
};
```

**Important**: `getEntry` returns `result` (array of arrays), `getEntryByUrl` returns `result[0]` (first page of results). When consuming, access `response[0][0]` for single entries from `getEntry`.

## Reference Field Resolution

Pass dot-notation paths to `includeReference()`:

```typescript
// Header: resolve page references in navigation menu
referenceFieldPath: ["navigation_menu.page_reference"]

// Page: resolve featured blogs in page components
referenceFieldPath: ["page_components.from_blog.featured_blogs"]

// Blog post: resolve author and related posts
referenceFieldPath: ["author", "related_post"]
```

## JSON RTE to HTML Conversion

Use `@contentstack/utils` `jsonToHTML` to convert JSON Rich Text Editor fields to HTML strings:

```typescript
import * as Utils from "@contentstack/utils";

const renderOption = {
  span: (node: any, next: any) => next(node.children),
};

Utils.jsonToHTML({
  entry: result,
  paths: ["body", "related_post.body"],
  renderOption,
});
```

Common JSON RTE paths by content type:
- **header**: `["notification_bar.announcement_text"]`
- **footer**: `["copyright"]`
- **page**: `["page_components.from_blog.featured_blogs.body", "page_components.section_with_buckets.buckets.description", "page_components.section_with_html_code.description"]`
- **blog_post**: `["body", "related_post.body"]`

## Live Preview Setup

Initialize `ContentstackLivePreview` after SDK setup:

```typescript
import ContentstackLivePreview from "@contentstack/live-preview-utils";

ContentstackLivePreview.init({
  stackSdk: Stack,
  clientUrlParams: {
    host: envConfig.CONTENTSTACK_APP_HOST,
  },
  ssr: false,
});

export const { onEntryChange } = ContentstackLivePreview;
```

In page components, use `onEntryChange` to subscribe to live updates:

```typescript
useEffect(() => {
  onEntryChange(() => fetchData());
}, [page]);
```

This re-fetches data whenever content editors change entries in the Contentstack UI.

## Live Edit Tags

When `CONTENTSTACK_LIVE_EDIT_TAGS=true`, inject editable DOM attributes:

```typescript
import { addEditableTags } from "@contentstack/utils";

// After fetching entry data
addEditableTags(response[0][0], "content_type_uid", true);
```

Components access edit tags via the `$` property:

```tsx
<h2 {...post.$?.title as {}}>{post.title}</h2>
<div {...post.$?.body as {}}>{parse(post.body)}</div>
```

## Region Configuration

Map region strings to SDK Region enum:

| String | Region | CDN Host |
|---|---|---|
| `us` (default) | `Region.US` | `cdn.contentstack.io` |
| `eu` | `Region.EU` | `eu-cdn.contentstack.com` |
| `azure-na` | `Region.AZURE_NA` | `azure-na-cdn.contentstack.com` |
| `azure-eu` | `Region.AZURE_EU` | `azure-eu-cdn.contentstack.com` |
| `gcp-na` | `Region.GCP_NA` | `gcp-na-cdn.contentstack.com` |

Custom host URLs have `api` replaced with `cdn` automatically.
