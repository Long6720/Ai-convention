#!/usr/bin/env python3
"""
Test script for the AI Code Review Agent
"""

import asyncio
import json
from services.main_service import MainService
from models import CodeReviewRequest, RuleUploadRequest

async def test_agent():
    """Test the AI agent with sample data"""
    
    print("🤖 Testing AI Code Review Agent...")
    print("=" * 50)
    
    # Initialize main service
    main_service = MainService()
    
    # Test 1: Upload sample rules
    print("\n📝 Test 1: Uploading sample coding rules...")
    
    sample_rules = """
    # Python Coding Standards
    
    ## Naming Conventions
    - Use snake_case for variables and functions
    - Use PascalCase for classes
    - Use UPPER_CASE for constants
    
    ## Code Structure
    - Maximum line length: 79 characters
    - Use 4 spaces for indentation
    - Separate functions with 2 blank lines
    - Separate classes with 2 blank lines
    
    ## Best Practices
    - Always use docstrings for functions and classes
    - Handle exceptions properly
    - Use type hints when possible
    - Avoid global variables
    - Prefer list comprehensions over loops when appropriate
    
    ## Security
    - Never use eval() or exec()
    - Validate all user inputs
    - Use parameterized queries for database operations
    - Sanitize data before output
    
    ## Performance
    - Use generators for large datasets
    - Avoid unnecessary object creation
    - Use built-in functions when possible
    - Profile code before optimization
    """
    
    upload_result = main_service.upload_rules(
        RuleUploadRequest(
            rules_text=sample_rules,
            rule_name="Python Standards",
            description="Python coding standards and best practices"
        )
    )
    
    print(f"Upload result: {upload_result['success']}")
    if upload_result['success']:
        print(f"✅ Rules uploaded: {upload_result['rule_name']}")
    else:
        print(f"❌ Failed to upload rules: {upload_result['message']}")
    
    # Test 2: Review sample Python code
    print("\n🔍 Test 2: Reviewing sample Python code...")
    
    sample_python_code = """
def calculate_total(items, discount=0):
    total = 0
    for item in items:
        total += item['price']
    
    if discount > 0:
        total = total * (1 - discount)
    
    return total

class UserManager:
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        self.users.append(user)
    
    def get_user(self, user_id):
        for user in self.users:
            if user.id == user_id:
                return user
        return None

# Global variable - bad practice
GLOBAL_CONFIG = {}
    
def main():
    print("Hello World")
    x = 10
    if x == 10:
        print("x is 10")
    else:
        print("x is not 10")
    
    # Unused variable
    unused_var = "this is never used"
    
    # Hardcoded values
    max_users = 1000
    
    return True
"""
    
    review_result = main_service.review_code_snippet(
        CodeReviewRequest(
            code=sample_python_code,
            language="Python"
        )
    )
    
    print(f"Review completed: {review_result.success}")
    print(f"Language detected: {review_result.language_detected}")
    print(f"Total issues found: {review_result.total_issues}")
    print(f"Critical issues: {review_result.critical_count}")
    print(f"Warnings: {review_result.warning_count}")
    print(f"Summary: {review_result.summary}")
    
    if review_result.review_results:
        print("\n📋 Detailed Review Results:")
        for i, issue in enumerate(review_result.review_results, 1):
            print(f"\n{i}. {issue.type.upper()}: {issue.rule}")
            print(f"   Description: {issue.description}")
            print(f"   Code: {issue.code}")
            print(f"   Suggestion: {issue.suggestion}")
            if issue.lineNumber > 0:
                print(f"   Line: {issue.lineNumber}")
    
    # Test 3: Search rules
    print("\n🔎 Test 3: Searching for rules...")
    
    search_result = main_service.search_rules("Python naming conventions", n_results=5)
    print(f"Search completed: {search_result['success']}")
    print(f"Found {len(search_result['rules'])} rules")
    
    # Test 4: Get all rules
    print("\n📚 Test 4: Getting all rules...")
    
    all_rules = main_service.get_all_rules()
    print(f"Retrieved {len(all_rules['rules'])} total rules")
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")
    
    return review_result

if __name__ == "__main__":
    # Run the test
    try:
        result = asyncio.run(test_agent())
        print(f"\n🎯 Final result: {result.success}")
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
