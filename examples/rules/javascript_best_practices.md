# JavaScript Best Practices

## Variable Declarations
- Use const by default, let when reassignment is needed
- Never use var (function-scoped, hoisting issues)
- Declare variables at the top of their scope
- Use meaningful variable names

## Function Design
- Keep functions small and focused (max 20 lines)
- Use arrow functions for callbacks and short functions
- Use default parameters instead of logical OR
- Functions should have a single responsibility

## Code Style
- Use 2 spaces for indentation
- Use semicolons consistently
- Use camelCase for variables and functions
- Use PascalCase for classes and constructors
- Use UPPER_SNAKE_CASE for constants

## Modern JavaScript Features
- Use template literals instead of string concatenation
- Use destructuring for objects and arrays
- Use spread/rest operators
- Use async/await instead of promises when possible

## Error Handling
- Always handle promise rejections
- Use try-catch for synchronous errors
- Provide meaningful error messages
- Log errors appropriately

## Security
- Never use eval() or Function constructor
- Validate and sanitize user inputs
- Use HTTPS in production
- Implement proper authentication

## Examples

### Good Code
```javascript
const calculateTotal = (items, discount = 0) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return discount > 0 ? total * (1 - discount) : total;
};

class UserManager {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }
  
  async createUser(userData) {
    try {
      const user = await this.userRepository.save(userData);
      return { success: true, user };
    } catch (error) {
      console.error('Failed to create user:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### Bad Code
```javascript
var total = 0;  // Bad: using var
for (var i = 0; i < items.length; i++) {  // Bad: using var
  total = total + items[i].price;  // Bad: inefficient
}
if (discount > 0) {
  total = total * (1 - discount);
}

function createUser(userData) {  // Bad: no error handling
  var user = userRepository.save(userData);  // Bad: no await
  console.log("User created");  // Bad: mixed concerns
  return user;
}
```
