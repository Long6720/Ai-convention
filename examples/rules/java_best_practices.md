# Java Best Practices

## Naming Conventions
- Use camelCase for variables and methods
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that explain purpose

## Class Design
- Keep classes focused and cohesive
- Maximum 200 lines per class
- Maximum 10 methods per class
- Use composition over inheritance

## Method Design
- Keep methods small and focused (max 20 lines)
- Maximum 3 parameters per method
- Use meaningful method names
- Methods should have a single responsibility

## Exception Handling
- Use specific exception types
- Always handle checked exceptions
- Provide meaningful error messages
- Use try-with-resources for resource management

## Performance
- Use StringBuilder for string concatenation in loops
- Prefer collections over arrays when size is unknown
- Use appropriate collection types
- Avoid creating objects in loops

## Examples

### Good Code
```java
public class UserService {
    private final UserRepository userRepository;
    private final UserValidator userValidator;
    
    public UserService(UserRepository userRepository, UserValidator userValidator) {
        this.userRepository = userRepository;
        this.userValidator = userValidator;
    }
    
    public User createUser(CreateUserRequest request) throws ValidationException {
        if (!userValidator.isValid(request)) {
            throw new ValidationException("Invalid user data");
        }
        
        User user = new User(request.getName(), request.getEmail());
        return userRepository.save(user);
    }
    
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }
}

public class User {
    private final Long id;
    private final String name;
    private final String email;
    
    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    // Getters only - immutable object
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
}
```

### Bad Code
```java
public class UserService {
    private Database database;  // Bad: direct dependency
    
    public User createUser(String name, String email, String role, 
                          String address, String phone, String company) {  // Bad: too many parameters
        // Bad: mixed responsibilities
        if (name == null || name.isEmpty()) {
            System.out.println("Name is required");  // Bad: presentation logic
            return null;
        }
        
        // Bad: business logic mixed with data access
        String sql = "INSERT INTO users (name, email, role, address, phone, company) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = database.prepareStatement(sql)) {
            stmt.setString(1, name);
            stmt.setString(2, email);
            stmt.setString(3, role);
            stmt.setString(4, address);
            stmt.setString(5, phone);
            stmt.setString(6, company);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();  // Bad: generic exception handling
        }
        
        return new User(name, email);  // Bad: incomplete object
    }
}
```
