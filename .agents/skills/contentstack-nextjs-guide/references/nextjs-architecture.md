# Next.js Architecture with Contentstack

## Table of Contents
- [Pages Router Pattern](#pages-router-pattern)
- [Data Fetching Strategy](#data-fetching-strategy)
- [Dynamic Component Rendering](#dynamic-component-rendering)
- [Layout and Shared Data](#layout-and-shared-data)
- [Adding New Pages](#adding-new-pages)
- [Adding New Components](#adding-new-components)
- [Content Type Schema](#content-type-schema)
- [next.config.js Patterns](#nextconfigjs-patterns)

## Pages Router Pattern

This project uses Next.js Pages Router (NOT App Router). All routes live in `pages/`.

```
pages/
├── _app.tsx         # Layout wrapper, fetches shared data (header, footer, entries)
├── _document.tsx    # Custom HTML document (CDN links for Bootstrap, Font Awesome)
├── 404.tsx          # Custom 404 page
├── index.tsx        # Home page (/)
├── [page].tsx       # Dynamic route for all CMS pages (e.g., /about, /contact)
├── sitemap.xml.tsx  # XML sitemap generator
└── blog/
    ├── index.tsx    # Blog listing (/blog)
    └── [post].tsx   # Blog post detail (/blog/my-post)
```

## Data Fetching Strategy

All pages use **Server-Side Rendering (SSR)** via `getServerSideProps`. Data is fetched at request time from Contentstack's Delivery API.

### Standard page pattern:

```typescript
// pages/[page].tsx
export async function getServerSideProps({ params }: any) {
  try {
    const entryUrl = params.page.includes('/') ? params.page : `/${params.page}`;
    const entryRes = await getPageRes(entryUrl);
    if (!entryRes) throw new Error('404');
    return {
      props: { entryUrl, page: entryRes },
    };
  } catch (error) {
    return { notFound: true };
  }
}
```

### Blog post pattern (fetches both page banner and post):

```typescript
// pages/blog/[post].tsx
export async function getServerSideProps({ params }: any) {
  try {
    const page = await getPageRes('/blog');           // Blog page for banner
    const posts = await getBlogPostRes(`/blog/${params.post}`); // Actual post
    if (!page || !posts) throw new Error('404');
    return {
      props: { pageUrl: `/blog/${params.post}`, blogPost: posts, page },
    };
  } catch (error) {
    return { notFound: true };
  }
}
```

### Live preview re-fetch pattern in components:

```typescript
const [getEntry, setEntry] = useState(page);

async function fetchData() {
  const entryRes = await getPageRes(entryUrl);
  if (!entryRes) throw new Error('Status code 404');
  setEntry(entryRes);
}

useEffect(() => {
  onEntryChange(() => fetchData());
}, [page]);
```

## Dynamic Component Rendering

Pages in Contentstack have a `page_components` array (modular blocks). Each block has one key identifying its type.

`RenderComponents` maps component types to React components:

```typescript
export default function RenderComponents(props: RenderProps) {
  const { pageComponents, blogPost, entryUid, contentTypeUid, locale } = props;
  return (
    <div data-pageref={entryUid} data-contenttype={contentTypeUid} data-locale={locale}>
      {pageComponents?.map((component, key) => {
        if (component.hero_banner)              return <HeroBanner ... />;
        if (component.section)                  return <Section ... />;
        if (component.section_with_buckets)     return <SectionBucket ... />;
        if (component.from_blog)                return <BlogSection ... />;
        if (component.section_with_cards)       return <CardSection ... />;
        if (component.section_with_html_code)   return <SectionWithHtmlCode ... />;
        if (component.our_team)                 return <TeamSection ... />;
      })}
    </div>
  );
}
```

The `data-pageref`, `data-contenttype`, `data-locale` attributes on the wrapper div are required for Contentstack live preview to identify the entry.

## Layout and Shared Data

`_app.tsx` uses `getInitialProps` to fetch layout data once per request:

```typescript
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  const header = await getHeaderRes();
  const footer = await getFooterRes();
  const entries = await getAllEntries();   // All pages, used for building nav
  return { ...appProps, header, footer, entries };
};
```

The `entries` array is used to build the navigation menu dynamically from all published pages.

## Adding New Pages

To add a new CMS-driven page:

1. Create the content type in Contentstack with a `url` field
2. Create an entry with the desired URL (e.g., `/services`)
3. The `[page].tsx` catch-all route will automatically resolve it

For new standalone routes:

1. Create a new file in `pages/` (e.g., `pages/services/index.tsx`)
2. Use `getServerSideProps` to fetch from Contentstack
3. Use `RenderComponents` or custom rendering

## Adding New Components

To add a new modular block component:

1. **Contentstack**: Add a new modular block field to the `page` content type
2. **TypeScript**: Add the new field to `Component` type in `typescript/component.ts`
3. **Component**: Create new component file in `components/`
4. **Mapper**: Add the new `if (component.your_field)` check in `components/render-components.tsx`
5. **Helper**: If the component has reference fields or JSON RTE fields, add the paths to `getPageRes` in `helper/index.ts`

## Content Type Schema

### header
- `navigation_menu` → array with `page_reference` (reference field)
- `notification_bar` → with `announcement_text` (JSON RTE)
- Logo, title fields

### footer
- `copyright` (JSON RTE)
- Navigation links, social links

### page
- `url` — page URL path
- `title` — page title
- `seo` — SEO metadata (enable_search_indexing, meta tags)
- `page_components` — modular blocks array containing:
  - `hero_banner`, `section`, `section_with_buckets`, `from_blog`, `section_with_cards`, `section_with_html_code`, `our_team`

### blog_post
- `url` — post URL path (e.g., `/blog/my-post`)
- `title`, `date`, `body` (JSON RTE)
- `author` — reference to author entries
- `related_post` — reference to other blog posts
- `featured_image` — image asset
- `is_archived` — boolean for archive filtering
- `seo` — SEO metadata

## next.config.js Patterns

Key configuration:

```javascript
const config = {
  publicRuntimeConfig: {
    // All CONTENTSTACK_* env vars exposed client-side
    // Required for live preview (client-side SDK re-init)
  },
  experimental: { largePageDataBytes: 128 * 100000 }, // ~12.8MB page data limit
};

// PWA disabled in dev, enabled in prod
module.exports = process.env.NODE_ENV === "development" ? config : withPWA(config);
```

**Important**: `publicRuntimeConfig` makes env vars available client-side. This is intentional — the Contentstack SDK needs to re-initialize on the client for live preview. These are delivery tokens (read-only), not management tokens.
