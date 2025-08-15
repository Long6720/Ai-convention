# TypeScript Best Practices

## Type Safety
- Always define explicit types for function parameters and return values
- Avoid using 'any' type - use 'unknown' for truly unknown types
- Use union types and intersection types appropriately
- Leverage TypeScript's type inference when types are obvious

## Interface Design
- Keep interfaces focused and minimal
- Use composition over inheritance
- Extend interfaces when adding functionality
- Use readonly for immutable properties

## Generic Types
- Use generics for reusable, type-safe code
- Constrain generics with extends when possible
- Use generic constraints to ensure type safety
- Leverage generic defaults for common use cases

## Error Handling
- Use Result types or Either types for error handling
- Define custom error types
- Use type guards for runtime type checking
- Handle all possible types in union types

## Code Organization
- Use barrel exports for clean imports
- Group related types and interfaces
- Use namespaces sparingly, prefer modules
- Keep type definitions close to their usage

## Examples

### Good Code
```typescript
interface User {
  readonly id: number;
  name: string;
  email: string;
  role: UserRole;
}

type UserRole = 'admin' | 'user' | 'moderator';

interface UserRepository<T extends User> {
  save(user: T): Promise<T>;
  findById(id: number): Promise<T | null>;
  update(id: number, updates: Partial<T>): Promise<T>;
}

class DatabaseUserRepository implements UserRepository<User> {
  constructor(private database: Database) {}
  
  async save(user: User): Promise<User> {
    const result = await this.database.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [user.name, user.email, user.role]
    );
    return { ...user, id: result.insertId };
  }
  
  async findById(id: number): Promise<User | null> {
    const result = await this.database.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return result[0] || null;
  }
  
  async update(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    await this.database.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [updatedUser.name, updatedUser.email, updatedUser.role, id]
    );
    
    return updatedUser;
  }
}
```

### Bad Code
```typescript
// Bad: using 'any' type
function processUser(user: any): any {
  return user;
}

// Bad: no explicit types
function createUser(name, email, role) {
  return { name, email, role };
}

// Bad: overly complex interface
interface UserService {
  createUser: (user: any) => any;
  updateUser: (id: any, user: any) => any;
  deleteUser: (id: any) => any;
  getUser: (id: any) => any;
  getAllUsers: () => any;
  searchUsers: (query: any) => any;
  validateUser: (user: any) => any;
  formatUser: (user: any) => any;
  exportUsers: (format: any) => any;
  importUsers: (data: any) => any;
}
```
