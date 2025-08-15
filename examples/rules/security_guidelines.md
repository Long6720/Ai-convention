# Security Guidelines

## Input Validation
- Always validate and sanitize user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Use HTTPS in production environments

## Common Vulnerabilities
- SQL Injection: Use parameterized queries
- XSS (Cross-Site Scripting): Sanitize HTML output
- CSRF (Cross-Site Request Forgery): Use CSRF tokens
- Path Traversal: Validate file paths
- Buffer Overflow: Use safe string functions

## Authentication & Authorization
- Use strong password policies
- Implement proper session management
- Use OAuth 2.0 or similar standards
- Implement role-based access control (RBAC)

## Data Protection
- Encrypt sensitive data at rest and in transit
- Use secure random number generators
- Implement proper logging without sensitive data
- Follow the principle of least privilege

## Examples

### Good Security Practices

#### Python - SQL Injection Prevention
```python
import sqlite3

def get_user_safe(user_id: int) -> Optional[User]:
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        result = cursor.fetchone()
        return User.from_row(result) if result else None

# Python - Input Validation
import re

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def sanitize_html(text: str) -> str:
    import html
    return html.escape(text)
```

#### JavaScript - XSS Prevention
```javascript
function displayUserInput(userInput) {
    const sanitized = userInput
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    
    document.getElementById('output').textContent = sanitized;
}

// JavaScript - CSRF Protection
async function makeAuthenticatedRequest(url, data) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(data)
    });
    
    return response.json();
}
```

### Bad Security Practices

#### Python - SQL Injection Vulnerable
```python
def get_user_unsafe(user_id):
    with sqlite3.connect('database.db') as conn:
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")  # Vulnerable!
        return cursor.fetchone()

# Python - XSS Vulnerable
def display_user_input_unsafe(user_input):
    return f"<div>{user_input}</div>"  # Vulnerable to XSS!
```

#### JavaScript - XSS Vulnerable
```javascript
function displayUserInputUnsafe(userInput) {
    document.getElementById('output').innerHTML = userInput;  // Vulnerable!
}

// JavaScript - No CSRF Protection
async function makeRequestUnsafe(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // Missing CSRF token!
        },
        body: JSON.stringify(data)
    });
    
    return response.json();
}
```
