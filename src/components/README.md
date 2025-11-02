# 🎨 Components Directory

This directory contains all **reusable React components** for the frontend.

## 📁 Organization

### `ui/` - Base UI Components
Foundational components from shadcn/ui. These are the building blocks used throughout the app.

**Examples**: Button, Card, Input, Dialog, etc.

### Root Components
Feature-specific and page-specific components.

## 📋 Component Categories

### 🏠 Dashboard Components
- `DashboardWelcome.tsx` - Welcome screen for new users

### 💬 Q&A Components
- `AskQuestionCard.tsx` - Main Q&A interface
- `AskQuestionCardInline.tsx` - Inline Q&A variant
- `AskQuestionCardSimple.tsx` - Simplified Q&A
- `AskQuestionCardEnhanced.tsx` - Enhanced Q&A with extra features
- `QuestionResultCard.tsx` - Display Q&A results

### 📄 Code Reference Components
- `CodeReferences.tsx` - Display code file references
- `CodeReferencesSimple.tsx` - Simplified code references

### 👥 Team Components
- `TeamMembers.tsx` - Team member management

### 📝 Git Components
- `CommitLog.tsx` - Display git commit history

### 🔧 Utility Components
- `LoadingSpinner.tsx` - Loading states
- `ErrorBoundary.tsx` - Error handling

## 🎯 Usage Guidelines

### Creating New Components

1. **Determine if it's reusable**
   - If yes → Add to `src/components/`
   - If page-specific → Keep in page folder

2. **Client vs Server Components**
   ```tsx
   // Client Component (needs interactivity)
   'use client';
   import { useState } from 'react';
   
   export function MyComponent() {
     const [state, setState] = useState();
     // ...
   }
   ```
   
   ```tsx
   // Server Component (default)
   export function MyComponent() {
     // No hooks, no browser APIs
     // Can fetch data directly
   }
   ```

3. **TypeScript Props**
   ```tsx
   interface MyComponentProps {
     title: string;
     count: number;
     onUpdate?: () => void;
   }
   
   export function MyComponent({ title, count, onUpdate }: MyComponentProps) {
     // ...
   }
   ```

### Best Practices

✅ **Do**:
- Use descriptive names
- Keep components focused
- Export named components
- Add TypeScript types
- Use composition over inheritance

❌ **Don't**:
- Create too many variants
- Mix concerns
- Hardcode data
- Skip TypeScript types

## 🔄 Component Patterns

### Container/Presentation Pattern
```tsx
// Container (handles logic)
function ProjectListContainer() {
  const { data } = api.project.getAll.useQuery();
  return <ProjectList projects={data} />;
}

// Presentation (handles UI)
function ProjectList({ projects }: { projects: Project[] }) {
  return <div>{projects.map(p => <ProjectCard key={p.id} {...p} />)}</div>;
}
```

### Compound Components
```tsx
function Card({ children }: { children: ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = function({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
</Card>
```

## 📦 Component Structure

```tsx
'use client'; // If needed

// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface MyComponentProps {
  // props
}

// 3. Component
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 3.1 Hooks
  const [state, setState] = useState();
  
  // 3.2 Handlers
  const handleClick = () => {
    // logic
  };
  
  // 3.3 Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 4. Default export (if needed)
export default MyComponent;
```

## 🎨 Styling Guidelines

- Use **Tailwind CSS** utility classes
- Follow the design system
- Keep styles consistent
- Use theme colors from globals.css

```tsx
// Good
<div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4">

// Avoid inline styles unless absolutely necessary
<div style={{ backgroundColor: 'blue' }}> // ❌
```

## 🧪 Testing Components

```tsx
// Add tests in __tests__ folder
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

**Remember**: Components should be reusable, maintainable, and follow React best practices!

