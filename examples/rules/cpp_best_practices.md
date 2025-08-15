# C++ Best Practices

## Memory Management
- Use smart pointers (unique_ptr, shared_ptr) instead of raw pointers
- Use RAII (Resource Acquisition Is Initialization)
- Avoid manual memory management
- Use containers from the standard library

## Modern C++ Features
- Use auto for type deduction when appropriate
- Use range-based for loops
- Use nullptr instead of NULL
- Use constexpr for compile-time constants
- Use lambda expressions for simple operations

## Class Design
- Follow the Rule of Three/Five/Zero
- Use const member functions when possible
- Prefer composition over inheritance
- Use virtual destructors for base classes

## Error Handling
- Use exceptions for exceptional cases
- Use std::optional for functions that might not return a value
- Use std::expected for functions that might fail
- Provide meaningful error messages

## Performance
- Pass large objects by const reference
- Use move semantics when appropriate
- Avoid unnecessary copies
- Use appropriate data structures

## Examples

### Good Code
```cpp
#include <memory>
#include <vector>
#include <string>
#include <optional>

class User {
private:
    std::string name;
    std::string email;
    std::string role;
    
public:
    User(std::string name, std::string email, std::string role)
        : name(std::move(name))
        , email(std::move(email))
        , role(std::move(role)) {}
    
    // Getters
    const std::string& getName() const { return name; }
    const std::string& getEmail() const { return email; }
    const std::string& getRole() const { return role; }
};

class UserRepository {
public:
    virtual ~UserRepository() = default;
    virtual std::optional<User> findById(int id) const = 0;
    virtual bool save(const User& user) = 0;
};

class DatabaseUserRepository : public UserRepository {
private:
    std::unique_ptr<Database> database;
    
public:
    explicit DatabaseUserRepository(std::unique_ptr<Database> db)
        : database(std::move(db)) {}
    
    std::optional<User> findById(int id) const override {
        try {
            auto result = database->query("SELECT * FROM users WHERE id = ?", id);
            if (result.empty()) {
                return std::nullopt;
            }
            return User{result["name"], result["email"], result["role"]};
        } catch (const DatabaseException& e) {
            return std::nullopt;
        }
    }
    
    bool save(const User& user) override {
        try {
            database->execute("INSERT INTO users (name, email, role) VALUES (?, ?, ?)",
                            user.getName(), user.getEmail(), user.getRole());
            return true;
        } catch (const DatabaseException& e) {
            return false;
        }
    }
};
```

### Bad Code
```cpp
class User {
private:
    char* name;  // Bad: raw pointer
    char* email;
    char* role;
    
public:
    User(char* n, char* e, char* r) {  // Bad: no const
        name = new char[strlen(n) + 1];  // Bad: manual memory management
        strcpy(name, n);
        email = new char[strlen(e) + 1];
        strcpy(email, e);
        role = new char[strlen(r) + 1];
        strcpy(role, r);
    }
    
    ~User() {  // Bad: manual cleanup
        delete[] name;
        delete[] email;
        delete[] role;
    }
    
    char* getName() { return name; }  // Bad: exposes internal data
    char* getEmail() { return email; }
    char* getRole() { return role; }
};

class UserService {
private:
    Database* db;  // Bad: raw pointer
    
public:
    UserService(Database* database) {
        db = database;  // Bad: no ownership semantics
    }
    
    User* createUser(char* name, char* email, char* role) {  // Bad: returns raw pointer
        if (strlen(name) == 0) {
            return NULL;  // Bad: using NULL instead of nullptr
        }
        
        User* user = new User(name, email, role);  // Bad: manual allocation
        // No error handling for database operations
        
        return user;
    }
};
```
