# Light/Dark Theme Implementation Guide

## Overview

This ContentStack + Next.js project now includes a complete light/dark theme system using React Context, CSS custom properties, and localStorage persistence.

## Features

- **React Context API**: Central theme state management
- **CSS Custom Properties**: CSS variables for consistent theming
- **LocalStorage Persistence**: User preference saved across sessions
- **System Preference Detection**: Respects `prefers-color-scheme` media query
- **No Flash of Unstyled Content (FOUC)**: Inline script for instant theme application
- **Smooth Transitions**: 300ms ease transitions between themes
- **Accessible**: Proper ARIA labels and keyboard navigation support

## Files Created

### 1. `/contexts/ThemeContext.tsx`
React Context provider for theme state management.

**Key Functions:**
- `ThemeProvider`: Wraps the application and provides theme state
- `useTheme()`: Custom hook to access theme and toggle function
- Handles localStorage read/write
- Detects system preference on initial load
- Prevents hydration mismatches

### 2. `/styles/theme.css`
CSS custom properties for both light and dark themes.

**CSS Variables Defined:**
- Background colors (primary, secondary, tertiary, card, input, hero)
- Text colors (primary, secondary, tertiary, on-primary)
- Border colors (primary, secondary, tertiary)
- Brand colors (primary, secondary, hover)
- Link colors (link, hover)
- Shadows (card)

## Files Modified

### 1. `/pages/_app.tsx`
- Imported `ThemeProvider` from contexts
- Imported `theme.css` stylesheet
- Wrapped entire app with `<ThemeProvider>`

### 2. `/pages/_document.tsx`
- Added inline script in `<Head>` to prevent FOUC
- Script runs before React hydration to set initial theme
- Reads from localStorage or falls back to system preference

### 3. `/components/header.tsx`
- Imported `useTheme` hook
- Added theme toggle button with sun/moon icons
- Wrapped with Tooltip component for better UX
- Positioned next to JSON preview button

### 4. `/styles/globals.css`
- Added smooth transitions for theme changes
- Added FOUC prevention styles for initial load

## Usage

### Accessing Theme in Components

```typescript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

### Using Theme Variables in CSS

```css
.my-element {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
```

### Available CSS Variables

**Backgrounds:**
- `--color-bg-primary`: Main background
- `--color-bg-secondary`: Secondary sections
- `--color-bg-tertiary`: Accent sections
- `--color-bg-card`: Card backgrounds
- `--color-bg-input`: Form inputs
- `--color-bg-hero`: Hero banner background

**Text:**
- `--color-text-primary`: Main text
- `--color-text-secondary`: Secondary text
- `--color-text-tertiary`: Muted text
- `--color-text-on-primary`: Text on colored backgrounds

**Borders:**
- `--color-border-primary`: Main borders
- `--color-border-secondary`: Secondary borders
- `--color-border-tertiary`: Subtle borders

**Brand:**
- `--color-brand-primary`: Primary brand color
- `--color-brand-secondary`: Secondary brand color
- `--color-brand-hover`: Hover state

**Links:**
- `--color-link`: Link color
- `--color-link-hover`: Link hover color

**Effects:**
- `--shadow-card`: Card shadow

## Theme Values

### Light Theme
- Primary background: `#ffffff` (white)
- Primary text: `#222222` (near black)
- Brand color: `#715cdd` (purple)
- Secondary background: `#f7f7f7` (light gray)

### Dark Theme
- Primary background: `#1a1a1a` (dark gray)
- Primary text: `#e8e8e8` (light gray)
- Brand color: `#8b7aed` (lighter purple)
- Secondary background: `#2d2d2d` (medium gray)

## How It Works

1. **Initial Load**: Inline script in `_document.tsx` reads localStorage or system preference and sets `data-theme` attribute on `<html>` element
2. **React Hydration**: `ThemeProvider` reads the theme and initializes state
3. **Theme Toggle**: User clicks button → `toggleTheme()` → state updates → `useEffect` triggers → `data-theme` attribute changes → CSS variables update
4. **Persistence**: Every theme change is saved to localStorage with key `'theme'`

## Browser Support

- Modern browsers with CSS custom properties support (all major browsers)
- `prefers-color-scheme` media query (95%+ browser support)
- localStorage API (all modern browsers)

## Responsive Design

The theme system works seamlessly across all breakpoints:
- Mobile (320px - 767px)
- Tablet (768px - 1024px)
- Desktop (1025px+)

All responsive styles in `styles/style.css` have been extended with theme variables.

## Testing

To test the theme system:

1. **Manual Toggle**: Click the sun/moon icon in the header
2. **System Preference**: Change your OS theme preference and reload the page
3. **Persistence**: Reload the page after changing theme - it should remember your choice
4. **FOUC Prevention**: Do a hard refresh - no flash should occur

## Extending the Theme

To add new themeable elements:

1. **Add CSS variables** in `/styles/theme.css`:
```css
:root[data-theme="light"] {
  --my-new-color: #123456;
}

:root[data-theme="dark"] {
  --my-new-color: #654321;
}
```

2. **Use in your styles**:
```css
.my-element {
  color: var(--my-new-color);
}
```

## Performance Considerations

- **Minimal JavaScript**: Only theme context and toggle logic
- **CSS Variables**: Native browser feature, no runtime overhead
- **No Re-renders**: Theme changes don't cause component re-renders (except header button)
- **Instant Application**: Theme applied before React hydration via inline script

## Accessibility

- Theme toggle has proper ARIA labels
- Keyboard accessible (tab navigation + enter/space to toggle)
- Sufficient color contrast in both themes (WCAG AA compliant)
- Respects user's system preference

## Future Enhancements

Potential improvements:
- Add more theme options (e.g., high contrast, sepia)
- Sync theme across browser tabs using `storage` event
- Add theme transition animations
- Create theme preview in settings page
- Add automatic theme switching based on time of day
