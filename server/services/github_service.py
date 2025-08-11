import requests
import base64
from typing import Dict, List, Optional
import re

class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "CodeReviewAgent"
        }
        if token:
            self.headers["Authorization"] = f"token {token}"
    
    def extract_pr_info(self, pr_url: str) -> Optional[Dict]:
        """Extract repository and PR number from GitHub PR URL"""
        pattern = r"github\.com/([^/]+)/([^/]+)/pull/(\d+)"
        match = re.match(pattern, pr_url)
        
        if match:
            owner, repo, pr_number = match.groups()
            return {
                "owner": owner,
                "repo": repo,
                "pr_number": int(pr_number)
            }
        return None
    
    def get_pr_files(self, owner: str, repo: str, pr_number: int) -> List[Dict]:
        """Get all files changed in a PR"""
        try:
            url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}/files"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            print(f"Error getting PR files: {e}")
            return []
    
    def get_file_content(self, owner: str, repo: str, path: str, ref: str) -> Optional[str]:
        """Get content of a specific file"""
        try:
            url = f"{self.base_url}/repos/{owner}/{repo}/contents/{path}"
            params = {"ref": ref}
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            content_data = response.json()
            if content_data.get("encoding") == "base64":
                content = base64.b64decode(content_data["content"]).decode("utf-8")
                return content
            return None
        except Exception as e:
            print(f"Error getting file content: {e}")
            return None
    
    def get_pr_details(self, owner: str, repo: str, pr_number: int) -> Optional[Dict]:
        """Get detailed information about a PR"""
        try:
            url = f"{self.base_url}/repos/{owner}/{repo}/pulls/{pr_number}"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            return response.json()
        except Exception as e:
            print(f"Error getting PR details: {e}")
            return None
    
    def extract_code_from_pr(self, pr_url: str) -> List[Dict]:
        """Extract all code changes from a PR"""
        pr_info = self.extract_pr_info(pr_url)
        if not pr_info:
            return []
        
        owner = pr_info["owner"]
        repo = pr_info["repo"]
        pr_number = pr_info["pr_number"]
        
        # Get PR details to get the base and head refs
        pr_details = self.get_pr_details(owner, repo, pr_number)
        if not pr_details:
            return []
        
        base_ref = pr_details["base"]["ref"]
        head_ref = pr_details["head"]["ref"]
        
        # Get all files changed
        files = self.get_pr_files(owner, repo, pr_number)
        
        code_changes = []
        for file in files:
            if file["status"] in ["modified", "added"]:
                # Get the new content
                content = self.get_file_content(owner, repo, file["filename"], head_ref)
                if content:
                    code_changes.append({
                        "filename": file["filename"],
                        "status": file["status"],
                        "content": content,
                        "language": self._detect_language(file["filename"]),
                        "additions": file.get("additions", 0),
                        "deletions": file.get("deletions", 0)
                    })
        
        return code_changes
    
    def _detect_language(self, filename: str) -> str:
        """Detect programming language based on file extension"""
        extension = filename.split(".")[-1].lower()
        
        language_map = {
            "py": "Python",
            "js": "JavaScript",
            "ts": "TypeScript",
            "jsx": "React JSX",
            "tsx": "React TSX",
            "java": "Java",
            "cpp": "C++",
            "c": "C",
            "cs": "C#",
            "php": "PHP",
            "rb": "Ruby",
            "go": "Go",
            "rs": "Rust",
            "swift": "Swift",
            "kt": "Kotlin",
            "scala": "Scala",
            "r": "R",
            "m": "Objective-C",
            "mm": "Objective-C++",
            "html": "HTML",
            "css": "CSS",
            "scss": "SCSS",
            "sass": "Sass",
            "sql": "SQL",
            "sh": "Shell",
            "bash": "Bash",
            "zsh": "Zsh",
            "fish": "Fish",
            "ps1": "PowerShell",
            "bat": "Batch",
            "yml": "YAML",
            "yaml": "YAML",
            "json": "JSON",
            "xml": "XML",
            "toml": "TOML",
            "ini": "INI",
            "cfg": "Configuration",
            "conf": "Configuration"
        }
        
        return language_map.get(extension, "Unknown")
