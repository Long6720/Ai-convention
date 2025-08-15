#!/usr/bin/env python3
"""
Simple script to upload rule files to the AI Code Review Agent
"""

import os
import requests
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:8000"
API_ENDPOINT = f"{API_BASE_URL}/api/rules/upload"

def upload_rule_file(file_path: str, rule_name: str, description: str):
    """Upload a single rule file to the AI Code Review Agent"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            rules_text = f.read()
        
        response = requests.post(
            API_ENDPOINT,
            data={
                'rules_text': rules_text,
                'rule_name': rule_name,
                'description': description
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Successfully uploaded: {rule_name}")
            print(f"   Message: {result.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Failed to upload: {rule_name}")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error uploading {rule_name}: {e}")
        return False

def main():
    """Main function to upload all rule files"""
    print("🚀 Starting Rule Upload Process")
    print("=" * 50)
    
    # Check if server is running
    try:
        health_check = requests.get(f"{API_BASE_URL}/health")
        if health_check.status_code == 200:
            print("✅ Server is running and accessible")
        else:
            print("⚠️  Server responded but with unexpected status")
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to server. Make sure it's running on http://localhost:8000")
        return
    
    # Define rules to upload
    rules_to_upload = [
        {
            "file": "python_best_practices.md",
            "name": "Python Best Practices",
            "description": "Python coding standards and best practices following PEP 8"
        },
        {
            "file": "python_solid_principles.md",
            "name": "Python SOLID Principles",
            "description": "SOLID principles implementation in Python"
        },
        {
            "file": "javascript_best_practices.md",
            "name": "JavaScript Best Practices",
            "description": "Modern JavaScript coding standards and best practices"
        },
        {
            "file": "javascript_solid_principles.md",
            "name": "JavaScript SOLID Principles",
            "description": "JavaScript SOLID principles and object-oriented design"
        },
        {
            "file": "typescript_best_practices.md",
            "name": "TypeScript Best Practices",
            "description": "TypeScript coding standards and type safety guidelines"
        },
        {
            "file": "java_best_practices.md",
            "name": "Java Best Practices",
            "description": "Java coding standards and object-oriented design principles"
        },
        {
            "file": "cpp_best_practices.md",
            "name": "C++ Best Practices",
            "description": "Modern C++ coding standards and memory management"
        },
        {
            "file": "security_guidelines.md",
            "name": "Security Guidelines",
            "description": "Security coding standards and vulnerability prevention"
        },
        {
            "file": "performance_guidelines.md",
            "name": "Performance Guidelines",
            "description": "Performance optimization and efficient coding practices"
        }
    ]
    
    print(f"\n📝 Uploading {len(rules_to_upload)} rules...")
    print("-" * 50)
    
    successful_uploads = 0
    failed_uploads = 0
    
    for rule in rules_to_upload:
        file_path = rule["file"]
        print(f"\n📤 Uploading: {rule['name']}")
        print(f"   File: {file_path}")
        
        if upload_rule_file(file_path, rule["name"], rule["description"]):
            successful_uploads += 1
        else:
            failed_uploads += 1
    
    print("\n" + "=" * 50)
    print("📊 Upload Summary")
    print(f"✅ Successful: {successful_uploads}")
    print(f"❌ Failed: {failed_uploads}")
    print(f"📝 Total: {len(rules_to_upload)}")
    
    if successful_uploads > 0:
        print(f"\n🎉 Successfully uploaded {successful_uploads} rules!")
        print("You can now use these rules in your AI Code Review Agent.")
        
        # Show how to use the rules
        print("\n💡 To test the rules:")
        print("1. Use the /api/review/code endpoint with some code")
        print("2. The AI will automatically use the uploaded rules")
        print("3. Check the review results for rule violations")
    
    if failed_uploads > 0:
        print(f"\n⚠️  {failed_uploads} rules failed to upload.")
        print("Check the error messages above for details.")

if __name__ == "__main__":
    main()
