# Frontend Architecture & Design Guidelines
**Role:** Senior Frontend Developer | Design Consistency Lead

---

## 1. Design System Inheritance

### Landing Page Design Reuse
- **Color Palette:** Maintain exact RGB/HEX values from landing page
  - Primary: [Define from landing]
  - Secondary: [Define from landing]
  - Accent: [Define from landing]
  - Neutrals: [Define from landing]

- **Typography Stack:** 
  - Headings: [Font family from landing]
  - Body: [Font family from landing]
  - Monospace: [Define for code blocks]

### Theme Consistency
```
App Theme Architecture:
├── Light Mode
│   ├── Background colors
│   ├── Text colors
│   └── Component states
├── Dark Mode
│   ├── Background colors
│   ├── Text colors
│   └── Component states
└── Accessibility
    ├── Contrast ratios (WCAG AA minimum)
    ├── Focus states
    └── Motion preferences
```

---

## 2. Component Library

### Base Components (Reusable)
- **Navigation**: Header, Sidebar, Breadcrumbs
- **Forms**: Input, Select, Checkbox, Radio, Toggle
- **Buttons**: Primary, Secondary, Tertiary, Danger states
- **Cards**: Container, elevated, flat variants
- **Modals**: Dialog, Confirmation, Sheet components
- **Data Display**: Table, List, Grid layouts
- **Feedback**: Toast, Alert, Skeleton loaders

### Custom Components (App-Specific)
- Agent Cards with status indicators
- Workflow visualization components
- Real-time status dashboards
- Prompt template editors

---

## 3. State Management Architecture

### Client State
```javascript
// Recommended: Zustand/Redux for:
- UI state (modals, sidebars, dropdowns)
- Theme preferences
- User session data
- Component visibility states
```

### Server State
```javascript
// Recommended: TanStack Query (React Query)
- API data caching
- Automatic refetching
- Optimistic updates
- Error handling & retries
```

---

## 4. Performance Optimization

### Code Splitting Strategy
- Lazy load route-based components
- Dynamic imports for heavy components
- Chunk size targets: <50KB per route

### Image Optimization
- WebP with fallbacks
- Responsive images with srcset
- Next.js Image component or similar
- Lazy loading for below-fold images

### Bundle Size Targets
- Initial JS: <150KB (gzipped)
- CSS: <30KB (gzipped)
- Third-party scripts: <100KB

---

## 5. Accessibility Standards

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- ARIA labels where necessary
- Keyboard navigation support
- Screen reader testing
- Color contrast ratios (4.5:1 minimum for text)

### Testing
```bash
# Automated testing
- axe-core for accessibility audits
- Pa11y for CI/CD integration
- Manual testing with screen readers
```

---

## 6. Browser & Device Support

### Target Browsers
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 14+, Chrome 90+

### Responsive Breakpoints
```css
xs: 320px
sm: 640px
md: 1024px
lg: 1280px
xl: 1536px
```

---

## 7. Development Standards

### File Structure
```
src/
├── components/
│   ├── common/
│   ├── features/
│   └── layout/
├── pages/
├── hooks/
├── utils/
├── services/
├── styles/
└── types/
```

### Naming Conventions
- Components: PascalCase
- Utilities: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: match component/export names

### Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Unit tests (Jest/Vitest)
- Integration tests (Cypress/Playwright)

---

## 8. API Integration Pattern

### HTTP Client Setup
```javascript
// Axios/Fetch wrapper with:
- Automatic token refresh
- Request/response interceptors
- Global error handling
- Retry logic
```

### Error Boundary Implementation
- Global error handler component
- Fallback UI for failed sections
- Error logging to monitoring service

---

## 9. Form Handling & Validation

### Form Libraries
- React Hook Form (lightweight, performant)
- Zod/Yup for validation schemas

### Validation Strategy
- Client-side validation for UX
- Server-side validation for security
- Real-time feedback
- Clear error messages

---

## 10. Monitoring & Analytics

### Performance Monitoring
- Web Vitals (LCP, FID, CLS)
- Custom metrics for user interactions
- Error tracking (Sentry/similar)

### User Analytics
- Page views and navigation
- Feature usage tracking
- User journey mapping
- A/B testing framework

---

## 11. Styling Approach

### CSS Strategy (Choose One)
```
Option A: Tailwind CSS
- Utility-first approach
- Theme configuration
- Custom component classes

Option B: CSS-in-JS (Styled Components/Emotion)
- Component-scoped styles
- Dynamic theming
- CSS variables for theme switching

Option C: BEM + SCSS
- Maintainable architecture
- Nested structure
- Mixin libraries
```

### Dark Mode Implementation
```javascript
// CSS Variables approach:
:root { --primary: #000; --bg: #fff; }
[data-theme="dark"] { --primary: #fff; --bg: #000; }
```

---

## 12. Design Tokens

### Spacing System
```
4px base unit
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px
```

### Shadow System
```
- Elevation 1: small shadows (cards)
- Elevation 2: medium shadows (modals)
- Elevation 3: large shadows (dropdowns)
```

### Border Radius
```
- sm: 2px, md: 4px, lg: 8px, xl: 12px
```

---

## 13. Mobile-First Development

### Responsive Strategy
- Mobile design first, then scale up
- Touch targets: 44x44px minimum
- Gesture support for mobile
- No hover states as primary interaction

### Progressive Enhancement
- Base functionality without JavaScript
- Enhanced experience with JS
- Graceful degradation

---

## 14. Testing Strategy

### Unit Tests
- Component logic (>80% coverage)
- Utility functions
- Hook logic

### Integration Tests
- User workflows
- Multi-component interactions
- API integration

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Performance testing

---

## 15. Deployment & Build Pipeline

### Build Configuration
```bash
# Production optimizations
- Code minification
- Tree shaking
- Asset compression
- Source maps for debugging
```

### Environment Management
```
.env.local - local development
.env.staging - staging environment
.env.production - production
```

---

## Checklist Before Going Live

- [ ] Design system documentation complete
- [ ] All components tested and documented
- [ ] Accessibility audit passed
- [ ] Performance metrics within targets
- [ ] Mobile responsiveness verified
- [ ] Error handling implemented
- [ ] Analytics configured
- [ ] Security headers configured
- [ ] SEO optimized
- [ ] Monitoring tools integrated
- [ ] User feedback mechanism ready
- [ ] Documentation updated
