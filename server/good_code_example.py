#!/usr/bin/env python3
"""
Example Python code for testing AI Code Review Agent
This code demonstrates both good practices and areas for improvement
"""

import json
import logging
from typing import List, Dict, Optional, Union
from dataclasses import dataclass
from pathlib import Path
import requests
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class User:
    """User data class with proper type hints and documentation"""
    id: int
    name: str
    email: str
    is_active: bool = True
    
    def __str__(self) -> str:
        return f"User(id={self.id}, name='{self.name}', email='{self.email}')"
    
    def to_dict(self) -> Dict[str, Union[int, str, bool]]:
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_active': self.is_active
        }

class UserManager:
    """Manages user operations with proper error handling"""
    
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def get_user(self, user_id: int) -> Optional[User]:
        """Retrieve user by ID with proper error handling"""
        try:
            response = self.session.get(f"{self.api_url}/users/{user_id}")
            response.raise_for_status()
            
            user_data = response.json()
            return User(**user_data)
            
        except requests.RequestException as e:
            logger.error(f"Failed to fetch user {user_id}: {e}")
            return None
        except (KeyError, TypeError) as e:
            logger.error(f"Invalid user data format: {e}")
            return None
    
    def create_user(self, name: str, email: str) -> Optional[User]:
        """Create a new user with validation"""
        if not self._validate_email(email):
            logger.error(f"Invalid email format: {email}")
            return None
        
        if not name or len(name.strip()) < 2:
            logger.error("Name must be at least 2 characters long")
            return None
        
        user_data = {
            'name': name.strip(),
            'email': email.lower().strip()
        }
        
        try:
            response = self.session.post(
                f"{self.api_url}/users",
                json=user_data
            )
            response.raise_for_status()
            
            user_data = response.json()
            return User(**user_data)
            
        except requests.RequestException as e:
            logger.error(f"Failed to create user: {e}")
            return None
    
    def update_user(self, user_id: int, **kwargs) -> bool:
        """Update user with provided fields"""
        try:
            response = self.session.patch(
                f"{self.api_url}/users/{user_id}",
                json=kwargs
            )
            response.raise_for_status()
            return True
            
        except requests.RequestException as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            return False
    
    def delete_user(self, user_id: int) -> bool:
        """Delete user by ID"""
        try:
            response = self.session.delete(f"{self.api_url}/users/{user_id}")
            response.raise_for_status()
            return True
            
        except requests.RequestException as e:
            logger.error(f"Failed to delete user {user_id}: {e}")
            return False
    
    def list_users(self, limit: int = 100, offset: int = 0) -> List[User]:
        """List users with pagination"""
        try:
            params = {'limit': min(limit, 1000), 'offset': max(offset, 0)}
            response = self.session.get(f"{self.api_url}/users", params=params)
            response.raise_for_status()
            
            users_data = response.json()
            return [User(**user_data) for user_data in users_data]
            
        except requests.RequestException as e:
            logger.error(f"Failed to list users: {e}")
            return []
    
    def _validate_email(self, email: str) -> bool:
        """Validate email format using simple regex"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit with cleanup"""
        self.session.close()

def process_users_data(users: List[User]) -> Dict[str, int]:
    """Process users data and return statistics"""
    if not users:
        return {'total': 0, 'active': 0, 'inactive': 0}
    
    total = len(users)
    active = sum(1 for user in users if user.is_active)
    inactive = total - active
    
    return {
        'total': total,
        'active': active,
        'inactive': inactive
    }

def save_users_report(users: List[User], filename: str) -> bool:
    """Save users report to JSON file"""
    try:
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'total_users': len(users),
            'users': [user.to_dict() for user in users],
            'statistics': process_users_data(users)
        }
        
        output_path = Path(filename)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Users report saved to {filename}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save report: {e}")
        return False

def main():
    """Main function demonstrating the usage"""
    api_url = "https://api.example.com"
    
    # Use context manager for proper resource management
    with UserManager(api_url) as user_manager:
        # Create some test users
        users = []
        
        test_users = [
            ("John Doe", "john.doe@example.com"),
            ("Jane Smith", "jane.smith@example.com"),
            ("Bob Johnson", "bob.johnson@example.com")
        ]
        
        for name, email in test_users:
            user = user_manager.create_user(name, email)
            if user:
                users.append(user)
                logger.info(f"Created user: {user}")
        
        # Process and save report
        if users:
            statistics = process_users_data(users)
            logger.info(f"User statistics: {statistics}")
            
            save_users_report(users, "reports/users_report.json")
        else:
            logger.warning("No users were created")

if __name__ == "__main__":
    main()
