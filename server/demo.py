#!/usr/bin/env python3
"""
Demo script for the AI Code Review Agent API
This script demonstrates how to use the API endpoints
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def print_response(response, title=""):
    """Print API response in a formatted way"""
    if title:
        print(f"\n{title}")
        print("=" * len(title))
    
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
    except:
        print(f"Response: {response.text}")
    print()

def test_health():
    """Test health endpoint"""
    print("🏥 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "Health Check Response")

def test_upload_rules():
    """Test uploading coding rules"""
    print("📝 Testing Rule Upload...")
    
    rules_text = """
    # JavaScript Coding Standards
    
    ## Naming Conventions
    - Use camelCase for variables and functions
    - Use PascalCase for classes and constructors
    - Use UPPER_SNAKE_CASE for constants
    
    ## Code Structure
    - Use 2 spaces for indentation
    - Use semicolons at the end of statements
    - Use const and let instead of var
    - Prefer arrow functions for callbacks
    
    ## Best Practices
    - Always use strict mode ('use strict')
    - Handle promises properly with .catch()
    - Use template literals instead of string concatenation
    - Avoid global variables
    - Use meaningful variable names
    
    ## Security
    - Never use eval() or Function constructor
    - Validate and sanitize user inputs
    - Use HTTPS in production
    - Implement proper authentication
    """
    
    data = {
        'rules_text': rules_text,
        'rule_name': 'JavaScript Standards',
        'description': 'JavaScript coding standards and best practices'
    }
    
    response = requests.post(f"{API_BASE}/rules/upload", data=data)
    print_response(response, "Rule Upload Response")
    
    return response.status_code == 200

def test_review_code():
    """Test code review functionality"""
    print("🔍 Testing Code Review...")
    
    sample_code = """
function calculateTotal(items, discount = 0) {
    let total = 0;
    
    for (let i = 0; i < items.length; i++) {
        total += items[i].price;
    }
    
    if (discount > 0) {
        total = total * (1 - discount);
    }
    
    return total;
}

class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
    }
    
    getUser(userId) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === userId) {
                return this.users[i];
            }
        }
        return null;
    }
}

// Global variable - bad practice
var globalConfig = {};

function main() {
    console.log("Hello World");
    var x = 10;
    if (x == 10) {
        console.log("x is 10");
    } else {
        console.log("x is not 10");
    }
    
    // Unused variable
    var unusedVar = "this is never used";
    
    // Hardcoded values
    var maxUsers = 1000;
    
    return true;
}
"""
    
    data = {
        'code': sample_code,
        'language': 'JavaScript'
    }
    
    response = requests.post(f"{API_BASE}/review/code", json=data)
    print_response(response, "Code Review Response")
    
    return response.status_code == 200

def test_search_rules():
    """Test rule search functionality"""
    print("🔎 Testing Rule Search...")
    
    query = "JavaScript naming conventions"
    response = requests.get(f"{API_BASE}/rules/search", params={'query': query, 'n_results': 5})
    print_response(response, "Rule Search Response")
    
    return response.status_code == 200

def test_get_all_rules():
    """Test getting all rules"""
    print("📚 Testing Get All Rules...")
    
    response = requests.get(f"{API_BASE}/rules")
    print_response(response, "Get All Rules Response")
    
    return response.status_code == 200

def test_github_pr_review():
    """Test GitHub PR review (this will fail without valid PR URL)"""
    print("📁 Testing GitHub PR Review...")
    
    # This is a dummy PR URL - it will fail but shows the API structure
    data = {
        'pr_url': 'https://github.com/username/repo/pull/123',
        'repository': 'username/repo',
        'branch': 'main'
    }
    
    try:
        response = requests.post(f"{API_BASE}/review/github-pr", json=data)
        print_response(response, "GitHub PR Review Response")
    except Exception as e:
        print(f"❌ GitHub PR review test failed (expected): {e}")
    
    return True

def test_security_analysis():
    """Test security analysis functionality"""
    print("🔒 Testing Security Analysis...")
    
    sample_code = """
function getUserData(userId) {
    // SQL injection vulnerability
    const query = "SELECT * FROM users WHERE id = " + userId;
    return db.execute(query);
}

function processInput(input) {
    // XSS vulnerability
    document.getElementById("output").innerHTML = input;
}

function authenticate(password) {
    // Weak password handling
    if (password === "admin123") {
        return true;
    }
    return false;
}
"""
    
    data = {
        'code': sample_code,
        'language': 'JavaScript'
    }
    
    response = requests.post(f"{API_BASE}/analysis/security", data=data)
    print_response(response, "Security Analysis Response")
    
    return response.status_code == 200

def test_performance_analysis():
    """Test performance analysis functionality"""
    print("⚡ Testing Performance Analysis...")
    
    sample_code = """
function findUser(users, targetId) {
    // O(n) search instead of O(1) hash lookup
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === targetId) {
            return users[i];
        }
    }
    return null;
}

function processLargeArray(items) {
    // Memory inefficient - creates new array
    const result = [];
    for (let i = 0; i < items.length; i++) {
        result.push(items[i] * 2);
    }
    return result;
}

function expensiveOperation() {
    // Expensive operation in loop
    for (let i = 0; i < 1000; i++) {
        const result = Math.pow(i, 2) + Math.sqrt(i);
        console.log(result);
    }
}
"""
    
    data = {
        'code': sample_code,
        'language': 'JavaScript'
    }
    
    response = requests.post(f"{API_BASE}/analysis/performance", data=data)
    print_response(response, "Performance Analysis Response")
    
    return response.status_code == 200

def test_comprehensive_analysis():
    """Test comprehensive analysis functionality"""
    print("🔍 Testing Comprehensive Analysis...")
    
    sample_code = """
class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        // Missing validation
        this.users.push(user);
    }
    
    getUser(userId) {
        // Inefficient search
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === userId) {
                return this.users[i];
            }
        }
        return null;
    }
    
    deleteUser(userId) {
        // No error handling
        const index = this.users.findIndex(u => u.id === userId);
        this.users.splice(index, 1);
    }
}
"""
    
    data = {
        'code': sample_code,
        'language': 'JavaScript'
    }
    
    response = requests.post(f"{API_BASE}/analysis/comprehensive", data=data)
    print_response(response, "Comprehensive Analysis Response")
    
    return response.status_code == 200

def main():
    """Run all demo tests"""
    print("🤖 AI Code Review Agent - API Demo")
    print("=" * 50)
    
    # Wait for server to be ready
    print("⏳ Waiting for server to be ready...")
    max_retries = 10
    for i in range(max_retries):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Server is ready!")
                break
        except:
            if i < max_retries - 1:
                print(f"⏳ Retrying... ({i+1}/{max_retries})")
                time.sleep(2)
            else:
                print("❌ Server is not responding. Please start the server first.")
                print("Run: python run.py")
                return
    
    # Run tests
    tests = [
        ("Health Check", test_health),
        ("Rule Upload", test_upload_rules),
        ("Code Review", test_review_code),
        ("Rule Search", test_search_rules),
        ("Get All Rules", test_get_all_rules),
        ("GitHub PR Review", test_github_pr_review),
        ("Security Analysis", test_security_analysis),
        ("Performance Analysis", test_performance_analysis),
        ("Comprehensive Analysis", test_comprehensive_analysis),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} failed with error: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
