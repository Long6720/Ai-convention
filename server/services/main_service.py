from typing import Dict, List, Any, Optional
from services.code_review_service import CodeReviewService
from services.github_service import GitHubService
from services.chroma_service import ChromaService
from services.advanced_analysis_service import AdvancedAnalysisService
from models import CodeReviewRequest, GitHubPRRequest, RuleUploadRequest, CodeReviewResponse, ReviewRule

class MainService:
    def __init__(self):
        self.code_review_service = CodeReviewService()
        self.github_service = GitHubService()
        self.chroma_service = ChromaService()
        self.advanced_analysis_service = AdvancedAnalysisService()
    
    def upload_rules(self, request: RuleUploadRequest) -> Dict[str, Any]:
        """Upload new review rules to the system"""
        try:
            success = self.chroma_service.add_rules(
                rules_text=request.rules_text,
                rule_name=request.rule_name,
                description=request.description
            )
            
            if success:
                return {
                    "success": True,
                    "message": f"Rules '{request.rule_name}' uploaded successfully",
                    "rule_name": request.rule_name,
                    "description": request.description
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to upload rules"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error uploading rules: {str(e)}"
            }
    
    def review_code_snippet(self, request: CodeReviewRequest) -> CodeReviewResponse:
        """Review a code snippet"""
        try:
            result = self.code_review_service.review_code(
                code=request.code,
                language=request.language
            )
            
            # Convert to ReviewRule objects
            review_rules = []
            for issue in result.get("review_results", []):
                review_rule = ReviewRule(
                    rule=issue.get("rule", "Unknown"),
                    title=issue.get("title", ""),
                    description=issue.get("description", ""),
                    code=issue.get("code", ""),
                    suggestion=issue.get("suggestion", ""),
                    lineNumber=issue.get("lineNumber", 0),
                    type=issue.get("type", "warning")
                )
                review_rules.append(review_rule)
            
            return CodeReviewResponse(
                success=result["success"],
                message=result["message"],
                review_results=review_rules,
                positive_aspects=result.get("positive_aspects", []),
                recommendations=result.get("recommendations", []),
                overall_assessment=result.get("overall_assessment", {}),
                summary=result["summary"],
                language_detected=result["language_detected"],
                overall_score=result["overall_score"],
                total_issues=result["total_issues"],
                critical_count=result["critical_count"],
                warning_count=result["warning_count"]
            )
        except Exception as e:
            return CodeReviewResponse(
                success=False,
                message=f"Error during code review: {str(e)}",
                review_results=[],
                summary="Code review failed due to an error",
                language_detected=request.language or "Unknown",
                overall_score=0,
                total_issues=0,
                critical_count=0,
                warning_count=0
            )
    
    def review_github_pr(self, request: GitHubPRRequest) -> Dict[str, Any]:
        """Review code from a GitHub PR"""
        try:
            # Extract code from PR
            code_changes = self.github_service.extract_code_from_pr(request.pr_url)
            
            if not code_changes:
                return {
                    "success": False,
                    "message": "No code changes found in the PR or failed to extract code"
                }
            
            # Review each file
            all_reviews = []
            total_issues = 0
            total_critical = 0
            total_warnings = 0
            
            for change in code_changes:
                review_result = self.code_review_service.review_code(
                    code=change["content"],
                    language=change["language"]
                )
                
                file_review = {
                    "filename": change["filename"],
                    "language": change["language"],
                    "status": change["status"],
                    "review": review_result,
                    "additions": change["additions"],
                    "deletions": change["deletions"]
                }
                
                all_reviews.append(file_review)
                total_issues += review_result.get("total_issues", 0)
                total_critical += review_result.get("critical_count", 0)
                total_warnings += review_result.get("warning_count", 0)
            
            # Generate overall summary
            if total_issues == 0:
                overall_summary = "✅ Excellent! No issues found across all files in the PR."
            else:
                overall_summary = f"🔍 PR review completed. Found {total_issues} total issue(s): {total_critical} critical and {total_warnings} warnings across {len(code_changes)} file(s)."
                
                if total_critical > 0:
                    overall_summary += f" ⚠️ {total_critical} critical issue(s) should be addressed before merging."
                
                if total_warnings > 0:
                    overall_summary += f" 💡 {total_warnings} warning(s) are recommendations for improvement."
            
            return {
                "success": True,
                "message": "GitHub PR review completed successfully",
                "pr_url": request.pr_url,
                "repository": request.repository,
                "branch": request.branch,
                "files_reviewed": len(code_changes),
                "overall_summary": overall_summary,
                "total_issues": total_issues,
                "critical_count": total_critical,
                "warning_count": total_warnings,
                "file_reviews": all_reviews
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error during GitHub PR review: {str(e)}"
            }
    
    def get_all_rules(self) -> Dict[str, Any]:
        """Get all uploaded rules"""
        try:
            rules = self.chroma_service.get_all_rules()
            return {
                "success": True,
                "message": f"Retrieved {len(rules)} rules",
                "rules": rules
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving rules: {str(e)}",
                "rules": []
            }
    
    def search_rules(self, query: str, n_results: int = 10) -> Dict[str, Any]:
        """Search for specific rules"""
        try:
            rules = self.chroma_service.search_rules(query, n_results)
            return {
                "success": True,
                "message": f"Found {len(rules)} rules matching '{query}'",
                "query": query,
                "rules": rules
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error searching rules: {str(e)}",
                "rules": []
            }
    
    def clear_rules(self) -> Dict[str, Any]:
        """Clear all rules from the system"""
        try:
            success = self.chroma_service.clear_rules()
            if success:
                return {
                    "success": True,
                    "message": "All rules cleared successfully"
                }
            else:
                return {
                    "success": False,
                    "message": "Failed to clear rules"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error clearing rules: {str(e)}"
            }
  