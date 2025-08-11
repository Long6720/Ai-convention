#!/usr/bin/env python3
"""
Test enhanced code review with comprehensive evaluation
"""
import os
import sys
sys.path.append('.')

from services.code_review_service import CodeReviewService

def test_enhanced_review():
    print("🧪 Testing enhanced code review...")
    
    # Initialize service
    review_service = CodeReviewService()
    
    # Test code with various issues and good practices
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
    
    print("📝 Testing code:")
    print(test_code)
    print("=" * 50)
    
    try:
        # Review code
        result = review_service.review_code(test_code, "Python")
        
        if result["success"]:
            print("✅ Review completed successfully!")
            print(f"📊 Total issues: {result['total_issues']}")
            print(f"🚨 Critical: {result['critical_count']}")
            print(f"⚠️  Warnings: {result['warning_count']}")
            print(f"🌍 Language: {result['language_detected']}")
            print(f"📝 Summary: {result['summary']}")
            
            print("\n🔍 Review Results:")
            for i, issue in enumerate(result['review_results'], 1):
                print(f"{i}. [{issue['type'].upper()}] {issue['rule']}")
                print(f"   Description: {issue['description']}")
                print(f"   Code: {issue['code']}")
                print(f"   Suggestion: {issue['suggestion']}")
                print(f"   Line: {issue['lineNumber']}")
                print()
        else:
            print(f"❌ Review failed: {result['message']}")
            
    except Exception as e:
        print(f"❌ Error during review: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_review()
