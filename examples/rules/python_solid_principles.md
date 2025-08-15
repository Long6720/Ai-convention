# Python SOLID Principles

## Single Responsibility Principle (SRP)
- Each class should have only one reason to change
- Separate concerns: data access, business logic, presentation
- One class = one responsibility

## Open/Closed Principle (OCP)
- Classes should be open for extension, closed for modification
- Use inheritance and polymorphism
- Design for extensibility

## Liskov Substitution Principle (LSP)
- Derived classes must be substitutable for their base classes
- Maintain consistent interfaces
- Follow the contract of parent classes

## Interface Segregation Principle (ISP)
- Keep interfaces focused and minimal
- Don't force classes to depend on methods they don't use
- Split large interfaces into smaller, specific ones

## Dependency Inversion Principle (DIP)
- Depend on abstractions, not concrete implementations
- Use dependency injection
- Invert control flow

## Examples

### Good Implementation
```python
from abc import ABC, abstractmethod
from typing import Protocol

class UserRepository(Protocol):
    def save(self, user: User) -> None: ...
    def find_by_id(self, user_id: int) -> Optional[User]: ...

class DatabaseUserRepository:
    def __init__(self, database: Database):
        self.database = database
    
    def save(self, user: User) -> None:
        self.database.execute("INSERT INTO users VALUES (?, ?, ?)", 
                            (user.id, user.name, user.email))
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        result = self.database.query("SELECT * FROM users WHERE id = ?", (user_id,))
        return User.from_dict(result) if result else None

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def create_user(self, name: str, email: str) -> User:
        user = User(name=name, email=email)
        self.user_repository.save(user)
        return user
```

### Bad Implementation
```python
class UserService:
    def __init__(self):
        self.database = Database()  # Direct dependency
    
    def create_user(self, name, email):
        # Mixed responsibilities: validation, creation, persistence
        if not name or not email:
            raise ValueError("Invalid input")
        
        user = User(name=name, email=email)
        self.database.execute("INSERT INTO users VALUES (?, ?, ?)", 
                            (user.id, user.name, user.email))
        
        # Also handling presentation
        print(f"User {name} created successfully")
        return user
```
