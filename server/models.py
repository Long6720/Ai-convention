from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
from enum import Enum

class ReviewRule(BaseModel):
    title: str
    rule: str
    description: str
    code: str
    suggestion: str
    lineNumber: int
    type: Literal["critical", "warning"]

class CodeReviewRequest(BaseModel):
    code: str
    language: Optional[str] = None
    file_path: Optional[str] = None

class GitHubPRRequest(BaseModel):
    pr_url: str
    repository: str
    branch: str

class CodeReviewResponse(BaseModel):
    success: bool
    message: str
    review_results: List[ReviewRule]
    positive_aspects: List[str] = []
    recommendations: List[str] = []
    overall_assessment: Dict[str, Any] = {}
    summary: str
    language_detected: str
    overall_score: int
    total_issues: int
    critical_count: int
    warning_count: int

class RuleUploadRequest(BaseModel):
    rules_text: str
    rule_name: str
    description: str
