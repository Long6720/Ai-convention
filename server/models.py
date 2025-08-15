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

class FileReview(BaseModel):
    filename: str
    language: str
    status: str
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
    additions: int = 0
    deletions: int = 0

class GitHubPRReviewResponse(BaseModel):
    success: bool
    message: str
    pr_url: str
    repository: str
    branch: str
    files_reviewed: int
    overall_summary: str
    total_issues: int
    critical_count: int
    warning_count: int
    overall_score: int
    review_results: List[ReviewRule]
    file_reviews: List[FileReview]
    positive_aspects: List[str] = []
    recommendations: List[str] = []

class RuleUploadRequest(BaseModel):
    rules_text: str
    rule_name: str
    description: str
