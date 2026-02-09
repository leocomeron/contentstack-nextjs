# ContentStack Specialist Memory

## Project: ContentStack Next.js Starter

### Tech Stack
- Next.js 14 with Pages Router (`pages/` directory)
- Bootstrap 5 via CDN (loaded in `pages/_document.tsx`)
- Custom CSS in `styles/style.css`, `styles/globals.css`, and `styles/theme.css`
- No CSS-in-JS or Tailwind - plain CSS + Bootstrap approach
- TypeScript throughout

### Project Structure
- **Layout Components**: `components/layout.tsx` wraps all pages
- **App Setup**: `_app.tsx` handles global layout with header/footer using `getInitialProps`
- **Header**: `components/header.tsx` includes navigation and utility buttons
- **Footer**: `components/footer.tsx` provides footer navigation
- **Content Components**: hero-banner, blog-banner, section, section-bucket, card-section, etc.

### Theme System Implementation
**Created Files:**
- `/contexts/ThemeContext.tsx` - React Context for theme state management
- `/styles/theme.css` - CSS custom properties (variables) for light/dark themes

**Modified Files:**
- `/pages/_app.tsx` - Wrapped with ThemeProvider, imported theme.css
- `/pages/_document.tsx` - Added inline script for initial theme detection
- `/components/header.tsx` - Added theme toggle button with sun/moon icons
- `/styles/globals.css` - Added theme transition and FOUC prevention

**Key Features:**
1. Uses CSS custom properties (`--color-bg-primary`, etc.) for theming
2. Theme persisted in localStorage with key `'theme'`
3. Respects system preference (`prefers-color-scheme`) as default
4. Inline script in `_document.tsx` prevents flash of unstyled content (FOUC)
5. Theme toggle button in header with Tooltip component
6. Smooth transitions between themes (0.3s ease)

**Color Scheme:**
- Primary brand color: `#715cdd` (light) / `#8b7aed` (dark)
- Background hierarchy: primary (white/dark), secondary (light gray/darker), tertiary (purple tint)
- Text hierarchy: primary, secondary, tertiary with appropriate contrast

### ContentStack SDK Setup
- Header and footer data fetched in `_app.tsx` using `getInitialProps`
- Helper functions: `getHeaderRes()`, `getFooterRes()`, `getAllEntries()`
- Live preview support with ContentStack SDK
- Navigation built dynamically from entries

### Development Notes
- Build system uses Next.js 14 with PWA support (next-pwa)
- Uses NProgress for route change loading indicators
- Skeleton loading states for CMS content (react-loading-skeleton)
- Bootstrap modals and tooltips used throughout
- JSON preview devtools modal for content inspection
