# AEI Codebase — Coding Conventions & Style Guide

## Overview

This guide defines coding standards and patterns for the AEI Student Assist application. Following these conventions ensures consistency, maintainability, and makes the codebase accessible to both human developers and AI agents.

---

## File Organization

### Component File Structure

Each React component file should follow this order:

```jsx
/**
 * [ComponentName] — Brief description
 * @component
 * @description Extended description of purpose and usage
 */
import { useState, useEffect } from 'react';

// ── Type Definitions ────────────────────────────────────────
// (JSDoc for props, interfaces)

// ── Helper Functions ────────────────────────────────────────
// Private functions used only by this component

// ── Main Component ──────────────────────────────────────────
/**
 * Component description for JSDoc
 * @param {ComponentProps} props
 */
export default function ComponentName({ prop1, prop2 }) {
  // Hooks first (conditional hooks not allowed)
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  function handleClick() {}
  
  // Early returns for loading/error states
  if (loading) return <Loading />;
  
  // Main render
  return <div>...</div>;
}
```

### Import Organization

Order imports strictly:

1. **External libraries** (react, react-router-dom, lucide-react, framer-motion)
2. **Internal path aliases** — grouped by alias:
   - `@components/*` (ui components, then layout, then auth)
   - `@context/*`
   - `@hooks/*`
   - `@pages/*`
   - `@data/*`
   - `@config/*`
   - `@utils/*`
   - `@services/*`
3. **Relative imports** (../../utils)

---

## Naming Conventions

### Components
- **File name**: PascalCase (`MockTestQuiz.jsx`)
- **Component name**: PascalCase, matches filename
- **Named exports** preferred for UI library components (allows tree-shaking)

### Functions & Variables
- **CamelCase** for functions and variables (`getMockTestCatalog`)
- **SCREAMING_SNAKE_CASE** for constants (`MAX_FILE_SIZE`)
- **Prefix hooks with `use`** (`useAuth`, `useTimer`)

### CSS Classes
- Use Tailwind utility classes exclusively
- Custom classes from index.css follow kebab-case: `.page-container`
- Design tokens via CSS variables: `var(--color-primary)`

### Boolean Variables
- Prefix with `is`, `has`, `can`, `should`:
  - `isLoading`, `hasPermission`, `canEdit`, `shouldRedirect`

---

## React Patterns

### Props and PropTypes

Always define prop types using JSDoc comments:

```jsx
/**
 * @typedef {Object} ButtonProps
 * @property {'primary'|'secondary'|'ghost'|'accent'} [variant='primary']
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {boolean} [disabled=false]
 * @property {React.ReactNode} [icon]
 * @property {function} [onClick]
 * @property {string} [className]
 * @property {React.ReactNode} children
 */

/**
 * @param {ButtonProps} props
 */
export default function Button({ variant = 'primary', children, ...props }) {
  // ...
}
```

### State Management

- **Local state**: Use `useState` for component-specific state
- **Shared state**: Use React Context (`@context/`)
- **Server state**: Consider SWR/React Query patterns (currently using manual fetch + Firestore)
- **Avoid prop drilling**: Use context for deeply nested shared state

### Conditional Rendering

Use ternary operators for simple conditions:
```jsx
{isVisible && <Component />}
{user ? <Dashboard /> : <LoginPrompt />}
```

### Event Handlers

- Name handlers descriptively: `handleSubmit`, `handleInputChange`
- Use arrow functions inline only for simple, inline handlers
- Prevents anonymous function recreation on re-renders

---

## Code Style

### Formatting
- **Indentation**: 2 spaces (configured in project)
- **Semicolons**: Not required (ESLint configured)
- **Quotes**: Single quotes preferred for strings
- **Trailing commas**: Yes (in multi-line structures)

### Functions

Prefer concise functions where appropriate:
```jsx
// Good
const add = (a, b) => a + b;
const fetchData = async (id) => {
  const data = await api.get(id);
  return data;
};
```

### Async/Await

Always use try/catch for async operations:
```jsx
async function loadData() {
  try {
    setLoading(true);
    const data = await fetchData(id);
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    setError(error);
  } finally {
    setLoading(false);
  }
}
```

---

## CSS & Tailwind

### Utility Classes
- Use Tailwind utilities for all styling
- Complex patterns can be extracted to custom classes in `index.css`
- Use CSS variables for theme tokens: `text-[var(--color-text-primary)]`

### Responsive Design
- Mobile-first approach with `sm:`, `md:`, `lg:`, `xl:` prefixes
- Avoid fixed pixel values for layout; use Tailwind's spacing scale

### Animations
- Prefer Framer Motion for React animations
- Use CSS transitions for simple hover effects
- Respect `prefers-reduced-motion`

---

## Error Handling

### User-Facing Errors
- Use `EmptyState` component for user-friendly error messages
- Provide actionable feedback (retry buttons, navigation options)

### API/Firebase Errors
- Log errors for debugging (console.error in development)
- Show user-friendly fallback UI
- Implement fallback mechanisms (e.g., local storage when Firebase fails)

---

## Documentation Standards

### File Headers
Every significant file should have a JSDoc header:
```javascript
/**
 * [Filename] — Brief description
 * @description Extended description
 * @module
 */
```

### Function Documentation
Document all exported functions and complex private functions:
```javascript
/**
 * Retrieves the mock test catalog
 * @returns {Promise<MockTest[]>} Array of available tests
 */
export async function fetchMockTestCatalog() {}
```

### Comments
- Comment **why**, not **what** (code shows what)
- TODO comments use format: `// TODO(username): description`
- Document non-obvious workarounds

---

## Testing Patterns

### Component Testing
- Test user interactions and expected outcomes
- Test edge cases (empty states, loading, errors)

### Integration Testing
- Mock Firebase/firestore for reliable tests
- Use consistent test data factories

---

## Performance Guidelines

### Code Splitting
- Lazy load all page components with `React.lazy()`
- Dynamic imports for heavy dependencies

### Rendering
- Memoize expensive computations with `useMemo`
- Prevent unnecessary re-renders with `React.memo`
- Keep component trees shallow

### Assets
- Optimize images before adding to project
- Use SVG icons from Lucide React (already tree-shakeable)
- Lazy load images with `loading="lazy"`

---

## Git Workflow

### Commit Messages
Follow conventional commits:
- `feat: add mock test timer feature`
- `fix: resolve login redirect issue`
- `docs: update README`
- `refactor: consolidate page structure`
- `chore: update dependencies`

### Branch Naming
- `feature/feature-name`
- `fix/issue-description`
- `refactor/scope-of-change`

---

## Security Considerations

- Never commit sensitive data (use `.env` files)
- Validate all user inputs
- Use Firebase security rules for data access control
- Sanitize data before rendering (prevent XSS)

---

## Accessibility (A11y)

- Use semantic HTML elements
- Include `alt` text for images
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Use ARIA attributes when semantic HTML isn't sufficient
- Test with screen readers

---

*Last Updated: June 2025*
*Maintained by: Development Team*