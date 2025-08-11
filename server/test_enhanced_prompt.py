#!/usr/bin/env python3
"""
Test enhanced prompt with comprehensive code review
"""
import os
import sys
sys.path.append('.')

from services.prompt_service import PromptService
from services.code_review_service import CodeReviewService

def test_enhanced_prompt():
    print("🧪 Testing enhanced prompt...")
    
    # Get prompts
    prompts = PromptService.get_prompts()
    code_review_prompt = prompts["code_review"]
    
    # Test code
    test_code = """
def calculate_factorial(n):
    if n < 0:
        return None
    if n == 0 or n == 1:
        return 1
    return n * calculate_factorial(n - 1)

def main():
    result = calculate_factorial(5)
    print(f"Factorial of 5 is: {result}")

if __name__ == "__main__":
    main()
"""
    
    # Test rules
    test_rules = """
- Functions should have docstrings
- Use meaningful variable names
- Handle edge cases properly
- Follow PEP 8 style guidelines
"""
    
    # Format prompt
    formatted_prompt = code_review_prompt.format(
        language="Python",
        rules_text=test_rules,
        code=test_code
    )
    
    print("📝 Enhanced Prompt:")
    print("=" * 50)
    print(formatted_prompt)
    print("=" * 50)
    
    print("\n✅ Enhanced prompt test completed!")

if __name__ == "__main__":
    test_enhanced_prompt()
