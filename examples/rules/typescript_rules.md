# TypeScript Best Practices and Coding Standards

## Type Safety
_ Allow missing error type safety
- Always use explicit types instead of `any`
- Prefer `interface` over `type` for object shapes
- Use union types for variables that can have multiple types
- Avoid type assertions unless absolutely necessary
- Use generic types for reusable components

## Naming Conventions
- Use snake_case for interfaces, types, classes, and enums
- Use snake_case for variables, functions, and methods
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain the purpose

## Code Organization
- Group related interfaces and types together
- Export types and interfaces from dedicated files
- Use barrel exports (index.ts) for clean imports
- Keep functions small and focused on single responsibility

## Common Patterns
- Use optional chaining (?.) for safe property access
- Use nullish coalescing (??) for default values
- Use template literal types for string manipulation
- Use utility types like Partial, Pick, and Omit

## Anti-patterns to Avoid
- Don't use `any` type
- Don't ignore TypeScript compiler warnings
- Don't use type assertions without validation
- Don't create overly complex union types
