from langchain.prompts import PromptTemplate
from typing import Dict

class PromptService:
    """Service for managing all prompt templates used in the AI agent"""
    
    @staticmethod
    def get_prompts() -> Dict[str, PromptTemplate]:
        """Get all prompt templates"""
        return {
            "code_review": PromptTemplate(
                input_variables=["language", "rules_text", "code"],
                template="""You are an expert code reviewer. Analyze the following {language} code.

Coding Rules:
{rules_text}

Return JSON with:
1. Issues found (problems to fix)
2. What's good (positive aspects)
3. Recommendations (improvements)
4. Overall score

Format:
{{
    "issues": [
        {{
            "title": "Issue title",
            "rule": "Rule name",
            "description": "Issue description",
            "code": "Code snippet",
            "suggestion": "How to fix",
            "lineNumber": line_number,
            "type": "critical" or "warning"
        }}
    ],
    "good_points": [
        "Good practice 1",
        "Good practice 2"
    ],
    "recommendations": [
        "Recommendation 1",
        "Recommendation 2"
    ],
    "overall_score": 80
}}

Code to review:
```{language}
{code}
```"""
            ),
            
            "language_detection": PromptTemplate(
                input_variables=["code"],
                template="""Analyze the following code and identify the programming language. 

Consider:
- Syntax patterns and keywords
- File extensions or shebang lines
- Language-specific constructs
- Common libraries and frameworks

Code:
{code}

Return only the language name (e.g., Python, JavaScript, Java, C++, C#, TypeScript, Go, Rust, Swift, etc.). If you cannot determine the language with confidence, return "Unknown"."""
            ),
            
            "summary_generation": PromptTemplate(
                input_variables=["language", "total_issues", "critical_count", "warning_count"],
                template="""Generate a concise, friendly summary of the code review results for {language} code.

Review Statistics:
- Total issues found: {total_issues}
- Critical issues: {critical_count}
- Warnings: {warning_count}

Generate a summary that:
1. Acknowledges the completion of the review
2. Provides a quick overview of findings
3. Gives actionable next steps based on issue severity
4. Uses appropriate emojis for visual appeal
5. Maintains a positive, encouraging tone

Keep it concise (2-3 sentences) but helpful and actionable."""
            ),
            
            "rule_analysis": PromptTemplate(
                input_variables=["rule_text", "code_snippet"],
                template="""Analyze how well the following code snippet follows the given coding rule.

Coding Rule:
{rule_text}

Code Snippet:
{code_snippet}

Evaluate:
1. Does the code follow this rule? (Yes/No/Partially)
2. If not, what specific violations exist?
3. What would be the impact of not following this rule?
4. How can the code be improved to better follow this rule?

Provide a brief, focused analysis."""
            ),
            
            "security_analysis": PromptTemplate(
                input_variables=["language", "code"],
                template="""You are a security expert specializing in {language} code analysis. Review the following code for security vulnerabilities.

Code:
```{language}
{code}
```

Focus on:
1. Input validation and sanitization
2. SQL injection vulnerabilities
3. Cross-site scripting (XSS)
4. Authentication and authorization issues
5. Secure coding practices
6. Data exposure risks
7. Cryptographic weaknesses

Return findings in this format:
{{
    "security_issues": [
        {{
            "vulnerability": "Type of security issue",
            "description": "Description of the vulnerability",
            "risk_level": "High/Medium/Low",
            "code_location": "Where in the code",
            "recommendation": "How to fix it"
        }}
    ]
}}

If no security issues are found, return an empty security_issues array."""
            ),
            
            "performance_analysis": PromptTemplate(
                input_variables=["language", "code"],
                template="""You are a performance optimization expert for {language} code. Analyze the following code for performance issues and optimization opportunities.

Code:
```{language}
{code}
```

Focus on:
1. Algorithm efficiency and complexity
2. Memory usage and allocation
3. I/O operations and bottlenecks
4. Loop optimizations
5. Data structure choices
6. Caching opportunities
7. Resource management

Return findings in this format:
{{
    "performance_issues": [
        {{
            "issue": "Type of performance issue",
            "description": "Description of the problem",
            "impact": "Performance impact description",
            "optimization": "Suggested optimization",
            "priority": "High/Medium/Low"
        }}
    ]
}}

If no performance issues are found, return an empty performance_issues array."""
            )
        }
    
    @staticmethod
    def get_prompt_names() -> list:
        """Get list of available prompt names"""
        return list(PromptService.get_prompts().keys())
    
    @staticmethod
    def get_prompt_by_name(name: str) -> PromptTemplate:
        """Get a specific prompt template by name"""
        prompts = PromptService.get_prompts()
        if name in prompts:
            return prompts[name]
        else:
            raise ValueError(f"Prompt '{name}' not found. Available prompts: {list(prompts.keys())}")
    
    @staticmethod
    def validate_prompt_variables(prompt_name: str, variables: Dict[str, str]) -> bool:
        """Validate that all required variables are provided for a prompt"""
        try:
            prompt = PromptService.get_prompt_by_name(prompt_name)
            required_vars = prompt.input_variables
            provided_vars = set(variables.keys())
            
            missing_vars = set(required_vars) - provided_vars
            if missing_vars:
                print(f"Missing variables for prompt '{prompt_name}': {missing_vars}")
                return False
            
            return True
        except Exception as e:
            print(f"Error validating prompt '{prompt_name}': {e}")
            return False
