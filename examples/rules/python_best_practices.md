# Python Best Practices

## Naming Conventions
- Use snake_case for variables, functions, and methods
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain the purpose

## Code Structure
- Maximum line length: 79 characters (PEP 8)
- Use 4 spaces for indentation (no tabs)
- Separate top-level functions and classes with two blank lines
- Separate methods within classes with one blank line

## Function Design
- Functions should be small and focused (max 20 lines)
- Maximum 3 parameters per function
- Use type hints for function parameters and return values
- Functions should have a single responsibility

## Error Handling
- Use specific exceptions, not bare except clauses
- Always handle exceptions at the appropriate level
- Use context managers (with statements) for resource management
- Provide meaningful error messages

## Performance
- Use list comprehensions instead of loops when appropriate
- Avoid creating unnecessary objects in loops
- Use generators for large datasets
- Prefer built-in functions over custom implementations

## Security
- Never use eval() or exec()
- Validate and sanitize all user inputs
- Use parameterized queries for database operations
- Avoid hardcoded secrets in code

## Examples

### Good Code
```python
def calculate_discount(items: List[Item], discount_rate: float) -> float:
    """Calculate total discount for a list of items."""
    if not items:
        return 0.0
    
    total = sum(item.price for item in items)
    return total * discount_rate

class UserManager:
    def __init__(self, database: Database):
        self.database = database
    
    def get_user(self, user_id: int) -> Optional[User]:
        """Retrieve user by ID."""
        try:
            return self.database.query("SELECT * FROM users WHERE id = ?", (user_id,))
        except DatabaseError as e:
            logger.error(f"Failed to retrieve user {user_id}: {e}")
            return None
```

### Bad Code
```python
def calc(items,dr):  # Bad: unclear names, no types
    t=0
    for i in items:
        t=t+i.price
    if dr>0:
        t=t*(1-dr)
    return t

class user_manager:  # Bad: wrong naming convention
    def __init__(self,db):
        self.db=db
    
    def get_user(self,uid):
        return self.db.query("SELECT * FROM users WHERE id = " + str(uid))  # SQL injection
```
