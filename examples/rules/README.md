# Coding Rules for AI Code Review Agent

This directory contains comprehensive coding rules for various programming languages that can be uploaded to your AI Code Review Agent system.

## 📁 Available Rule Files

### 🐍 Python Rules
- **`python_best_practices.md`** - Python coding standards and best practices following PEP 8
- **`python_solid_principles.md`** - SOLID principles implementation in Python

### 🟨 JavaScript Rules
- **`javascript_best_practices.md`** - Modern JavaScript coding standards and best practices
- **`javascript_solid_principles.md`** - JavaScript SOLID principles and object-oriented design

### 🔷 TypeScript Rules
- **`typescript_best_practices.md`** - TypeScript coding standards and type safety guidelines

### ☕ Java Rules
- **`java_best_practices.md`** - Java coding standards and object-oriented design principles

### ⚡ C++ Rules
- **`cpp_best_practices.md`** - Modern C++ coding standards and memory management

### 🔒 General Rules
- **`security_guidelines.md`** - Security coding standards and vulnerability prevention
- **`performance_guidelines.md`** - Performance optimization and efficient coding practices

## 🚀 How to Use These Rules

### 1. Upload Rules to Your AI Agent

You can upload these rules using the API endpoint:

```bash
# Example: Upload Python best practices
curl -X POST "http://localhost:8000/api/rules/upload" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "rules_text=$(cat examples/rules/python_best_practices.md)" \
  -d "rule_name=Python Best Practices" \
  -d "description=Python coding standards and best practices following PEP 8"
```

### 2. Using the TypeScript Client

```typescript
import { AICodeReviewService } from './services/api-service';

const service = new AICodeReviewService();

// Upload a rule
const ruleText = await fetch('./examples/rules/python_best_practices.md').then(r => r.text());
await service.uploadRules(ruleText, 'Python Best Practices', 'Python coding standards');

// Review code with the uploaded rules
const review = await service.reviewCode({
  code: 'your python code here',
  language: 'python'
});
```

### 3. Using Python Scripts

```python
import requests

def upload_rule(rule_file_path, rule_name, description):
    with open(rule_file_path, 'r') as f:
        rules_text = f.read()
    
    response = requests.post(
        'http://localhost:8000/api/rules/upload',
        data={
            'rules_text': rules_text,
            'rule_name': rule_name,
            'description': description
        }
    )
    
    return response.json()

# Upload Python rules
upload_rule(
    'examples/rules/python_best_practices.md',
    'Python Best Practices',
    'Python coding standards and best practices following PEP 8'
)
```

## 📋 Rule Categories

### **Best Practices**
- Naming conventions
- Code structure and formatting
- Function and method design
- Error handling patterns
- Performance considerations

### **SOLID Principles**
- Single Responsibility Principle (SRP)
- Open/Closed Principle (OCP)
- Liskov Substitution Principle (LSP)
- Interface Segregation Principle (ISP)
- Dependency Inversion Principle (DIP)

### **Security Guidelines**
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Authentication and authorization

### **Performance Guidelines**
- Algorithm efficiency
- Memory management
- Database optimization
- Code optimization strategies

## 🎯 What Each Rule File Contains

Each rule file includes:

1. **Clear Guidelines** - Specific, actionable coding standards
2. **Good Examples** - Code snippets demonstrating best practices
3. **Bad Examples** - Code snippets showing what to avoid
4. **Language-Specific Patterns** - Tailored to each programming language
5. **Real-World Scenarios** - Practical examples from common use cases

## 🔧 Customizing Rules

You can customize these rules by:

1. **Editing the markdown files** to match your team's coding standards
2. **Adding new rules** specific to your project requirements
3. **Combining rules** from different files into custom rule sets
4. **Updating examples** to match your codebase patterns

## 📊 Testing Your Rules

After uploading rules, test them by:

1. **Reviewing code snippets** that should trigger violations
2. **Checking rule detection** accuracy
3. **Verifying suggestions** are helpful and actionable
4. **Testing edge cases** to ensure robust detection

## 🆘 Troubleshooting

### Common Issues

- **Rules not detected**: Ensure the rule text is properly formatted and uploaded
- **False positives**: Adjust rule descriptions to be more specific
- **Missing violations**: Check if the rule text covers the specific case
- **API errors**: Verify the server is running and the endpoint is correct

### Getting Help

- Check the API documentation at `/docs` endpoint
- Review the rule upload response for error messages
- Ensure rule text follows the expected format
- Test with simple examples first

## 📈 Best Practices for Rule Management

1. **Start Small** - Begin with a few core rules and expand gradually
2. **Test Thoroughly** - Validate rules with real code examples
3. **Iterate** - Refine rules based on feedback and usage
4. **Document** - Keep rule descriptions clear and actionable
5. **Version Control** - Track changes to your rule sets

## 🔗 Related Resources

- [AI Code Review Agent API Documentation](../README.md)
- [API Service Client](../client/services/api-service.ts)
- [Example Usage](../client/services/example-usage.ts)
- [Server Configuration](../server/README.md)

---

These rules will help your AI Code Review Agent catch common coding issues, enforce best practices, and maintain code quality across your projects. Start with the rules most relevant to your current development stack and gradually expand your rule set as needed.
