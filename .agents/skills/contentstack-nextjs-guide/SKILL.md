---
name: contentstack-nextjs-guide
description: "Guide for correctly implementing Contentstack headless CMS with Next.js projects. Use when working on Contentstack + Next.js integration tasks including: (1) Setting up or configuring the Contentstack SDK, (2) Creating new pages or components that fetch CMS content, (3) Configuring environment variables and regional settings, (4) Setting up live preview or live editing, (5) Deploying to Contentstack Launch or Vercel, (6) Adding new content types or modular blocks, (7) Troubleshooting Contentstack data fetching, reference resolution, or JSON RTE rendering."
---

# Contentstack + Next.js Implementation Guide

## Project Setup

Install dependencies:

```bash
npm install contentstack @contentstack/utils @contentstack/live-preview-utils
```

Copy `.env.local.sample` to `.env.local` and fill in credentials. Required: `CONTENTSTACK_API_KEY`, `CONTENTSTACK_DELIVERY_TOKEN`, `CONTENTSTACK_ENVIRONMENT`.

## Architecture Overview

This project uses Next.js **Pages Router** with SSR (`getServerSideProps`). The data flow is:

1. `contentstack-sdk/utils.ts` — SDK initialization, config validation, region handling
2. `contentstack-sdk/index.ts` — Core API: `getEntry()`, `getEntryByUrl()`, `onEntryChange()`
3. `helper/index.ts` — Higher-level fetchers with reference resolution and JSON RTE conversion
4. Pages call helpers in `getServerSideProps`, pass data to components
5. `components/render-components.tsx` — Maps `page_components` array to React components

## Core Implementation Patterns

### Fetching CMS Data in Pages

Every page uses `getServerSideProps` to fetch data and the `onEntryChange` hook for live preview:

```typescript
export default function Page({ page, entryUrl }) {
  const [getEntry, setEntry] = useState(page);

  async function fetchData() {
    const entryRes = await getPageRes(entryUrl);
    if (!entryRes) throw new Error('Status code 404');
    setEntry(entryRes);
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, [page]);

  return getEntry.page_components
    ? <RenderComponents pageComponents={getEntry.page_components} contentTypeUid='page' entryUid={getEntry.uid} locale={getEntry.locale} />
    : <Skeleton count={3} height={300} />;
}

export async function getServerSideProps({ params }) {
  try {
    const entryUrl = params.page.includes('/') ? params.page : `/${params.page}`;
    const entryRes = await getPageRes(entryUrl);
    if (!entryRes) throw new Error('404');
    return { props: { entryUrl, page: entryRes } };
  } catch (error) {
    return { notFound: true };
  }
}
```

### Adding a New Component

1. Add modular block field to `page` content type in Contentstack
2. Add type to `typescript/component.ts`
3. Create component in `components/`
4. Add `if (component.your_field)` check in `components/render-components.tsx`
5. If the component has reference or JSON RTE fields, add paths to `getPageRes` in `helper/index.ts`

### Helper Function Pattern

Each helper resolves references and converts JSON RTE fields:

```typescript
export const getPageRes = async (entryUrl: string): Promise<Page> => {
  const response = (await getEntryByUrl({
    contentTypeUid: "page",
    entryUrl,
    referenceFieldPath: ["page_components.from_blog.featured_blogs"],
    jsonRtePath: [
      "page_components.from_blog.featured_blogs.body",
      "page_components.section_with_buckets.buckets.description",
      "page_components.section_with_html_code.description",
    ],
  })) as Page[];
  liveEdit && addEditableTags(response[0], "page", true);
  return response[0];
};
```

### Environment Variable Handling

All `CONTENTSTACK_*` vars are exposed via `publicRuntimeConfig` in `next.config.js` for client-side access. The SDK uses a dual-source pattern:

```typescript
const envConfig = process.env.CONTENTSTACK_API_KEY ? process.env : publicRuntimeConfig;
```

**Critical**: `CONTENTSTACK_LIVE_PREVIEW` is compared with `=== "true"` (string comparison).

## Detailed References

- **SDK initialization, entry fetching, reference resolution, JSON RTE, live preview/edit setup, regions**: See [references/sdk-integration.md](references/sdk-integration.md)
- **Pages Router structure, data fetching patterns, dynamic component rendering, layout, adding pages/components, content type schemas, next.config.js**: See [references/nextjs-architecture.md](references/nextjs-architecture.md)
- **Deploying to Contentstack Launch or Vercel, environment setup per platform, regional API hosts, content seeding, troubleshooting**: See [references/deployment.md](references/deployment.md)
