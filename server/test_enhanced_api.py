#!/usr/bin/env python3
"""
Test enhanced API with good points and recommendations
"""
import requests
import json
import time

def test_enhanced_api():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Enhanced Code Review API...")
    print("=" * 50)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"✅ Health: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health failed: {e}")
        return
    
    # Test 2: Enhanced code review
    print("\n2. Testing enhanced code review...")
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
    
    data = {
        "code": test_code,
        "language": "Python"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/review/code",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Found {result.get('total_issues', 0)} issues")
            print(f"Critical: {result.get('critical_count', 0)}")
            print(f"Warnings: {result.get('warning_count', 0)}")
            print(f"Summary: {result.get('summary', 'N/A')}")
            
            # Check new fields
            print(f"\n📈 Good Points: {len(result.get('positive_aspects', []))}")
            for i, point in enumerate(result.get('positive_aspects', []), 1):
                print(f"   {i}. {point}")
            
            print(f"\n💡 Recommendations: {len(result.get('recommendations', []))}")
            for i, rec in enumerate(result.get('recommendations', []), 1):
                print(f"   {i}. {rec}")
            
            print(f"\n📊 Overall Assessment: {result.get('overall_assessment', {})}")
            
        else:
            print(f"❌ Failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Code review failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Enhanced API testing completed!")

if __name__ == "__main__":
    test_enhanced_api()
