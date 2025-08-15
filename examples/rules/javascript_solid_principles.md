# JavaScript SOLID Principles

## Single Responsibility Principle
- Each function/class should do one thing well
- Separate concerns: data, logic, presentation
- One function = one responsibility

## Open/Closed Principle
- Open for extension, closed for modification
- Use composition over inheritance
- Design for extensibility

## Liskov Substitution Principle
- Derived classes must be substitutable
- Maintain consistent interfaces
- Follow parent class contracts

## Interface Segregation Principle
- Keep interfaces focused and minimal
- Don't force dependencies on unused methods
- Split large interfaces into smaller ones

## Dependency Inversion Principle
- Depend on abstractions, not concretions
- Use dependency injection
- Invert control flow

## Examples

### Good Implementation
```javascript
// Interface (using JSDoc for clarity)
/**
 * @interface UserRepository
 * @property {function(User): Promise<User>} save
 * @property {function(number): Promise<User>} findById
 */

class DatabaseUserRepository {
  constructor(database) {
    this.database = database;
  }
  
  async save(user) {
    const result = await this.database.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [user.name, user.email]
    );
    return { ...user, id: result.insertId };
  }
  
  async findById(id) {
    const result = await this.database.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return result[0] || null;
  }
}

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async createUser(userData) {
    const user = await this.userRepository.save(userData);
    return user;
  }
}

// Usage with dependency injection
const userService = new UserService(new DatabaseUserRepository(database));
```

### Bad Implementation
```javascript
class UserService {
  constructor() {
    this.database = new Database();  // Direct dependency
  }
  
  async createUser(userData) {
    // Mixed responsibilities
    if (!userData.name || !userData.email) {
      throw new Error('Invalid input');
    }
    
    const user = await this.database.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email]
    );
    
    // Also handling presentation
    console.log(`User ${userData.name} created successfully`);
    return user;
  }
}
```
