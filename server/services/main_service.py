from typing import Dict, List, Any, Optional
from services.code_review_service import CodeReviewService
from services.github_service import GitHubService
from services.chroma_service import ChromaService
from services.advanced_analysis_service import AdvancedAnalysisService
from models import CodeReviewRequest, GitHubPRRequest, RuleUploadRequest, CodeReviewResponse, ReviewRule, FileReview, GitHubPRReviewResponse

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
    
    def review_github_pr(self, request: GitHubPRRequest) -> GitHubPRReviewResponse:
        """Review code from a GitHub PR"""
        try:
            # Extract PR info from URL
            pr_info = self.github_service.extract_pr_info(request.pr_url)
            if not pr_info:
                return GitHubPRReviewResponse(
                    success=False,
                    message="Failed to extract PR information from URL",
                    pr_url=request.pr_url,
                    repository="",
                    branch="",
                    files_reviewed=0,
                    overall_summary="",
                    total_issues=0,
                    critical_count=0,
                    warning_count=0,
                    overall_score=0,
                    review_results=[],
                    file_reviews=[]
                )
            
            # Extract code from PR
            code_changes = self.github_service.extract_code_from_pr(request.pr_url)
            
            if not code_changes:
                return GitHubPRReviewResponse(
                    success=False,
                    message="No code changes found in the PR or failed to extract code",
                    pr_url=request.pr_url,
                    repository=f"{pr_info['owner']}/{pr_info['repo']}",
                    branch=f"PR #{pr_info['pr_number']}",
                    files_reviewed=0,
                    overall_summary="",
                    total_issues=0,
                    critical_count=0,
                    warning_count=0,
                    overall_score=0,
                    review_results=[],
                    file_reviews=[]
                )
            
            # Review each file
            file_reviews = []
            all_review_results = []
            total_issues = 0
            total_critical = 0
            total_warnings = 0
            overall_score = 0
            all_positive_aspects = []
            all_recommendations = []
            
            for change in code_changes:
                review_result = self.code_review_service.review_code(
                    code=change["content"],
                    language=change["language"]
                )
                
                # Convert to ReviewRule objects
                review_rules = []
                for issue in review_result.get("review_results", []):
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
                
                file_review = FileReview(
                    filename=change["filename"],
                    language=change["language"],
                    status=change["status"],
                    review_results=review_rules,
                    positive_aspects=review_result.get("positive_aspects", []),
                    recommendations=review_result.get("recommendations", []),
                    overall_assessment=review_result.get("overall_assessment", {}),
                    summary=review_result.get("summary", ""),
                    language_detected=review_result.get("language_detected", change["language"]),
                    overall_score=review_result.get("overall_score", 0),
                    total_issues=review_result.get("total_issues", 0),
                    critical_count=review_result.get("critical_count", 0),
                    warning_count=review_result.get("warning_count", 0),
                    additions=change.get("additions", 0),
                    deletions=change.get("deletions", 0)
                )
                
                file_reviews.append(file_review)
                all_review_results.extend(review_rules)
                total_issues += review_result.get("total_issues", 0)
                total_critical += review_result.get("critical_count", 0)
                total_warnings += review_result.get("warning_count", 0)
                overall_score += review_result.get("overall_score", 0)
                all_positive_aspects.extend(review_result.get("positive_aspects", []))
                all_recommendations.extend(review_result.get("recommendations", []))
            
            # Calculate average overall score
            avg_overall_score = overall_score // len(code_changes) if code_changes else 0
            
            # Generate overall summary
            if total_issues == 0:
                overall_summary = "✅ Excellent! No issues found across all files in the PR."
            else:
                overall_summary = f"🔍 PR review completed. Found {total_issues} total issue(s): {total_critical} critical and {total_warnings} warnings across {len(code_changes)} file(s)."
                
                if total_critical > 0:
                    overall_summary += f" ⚠️ {total_critical} critical issue(s) should be addressed before merging."
                
                if total_warnings > 0:
                    overall_summary += f" 💡 {total_warnings} warning(s) are recommendations for improvement."
            
            return GitHubPRReviewResponse(
                success=True,
                message="GitHub PR review completed successfully",
                pr_url=request.pr_url,
                repository=f"{pr_info['owner']}/{pr_info['repo']}",
                branch=f"PR #{pr_info['pr_number']}",
                files_reviewed=len(code_changes),
                overall_summary=overall_summary,
                total_issues=total_issues,
                critical_count=total_critical,
                warning_count=total_warnings,
                overall_score=avg_overall_score,
                review_results=all_review_results,
                file_reviews=file_reviews,
                positive_aspects=all_positive_aspects,
                recommendations=all_recommendations
            )
            
        except Exception as e:
            return GitHubPRReviewResponse(
                success=False,
                message=f"Error during GitHub PR review: {str(e)}",
                pr_url=request.pr_url,
                repository="",
                branch="",
                files_reviewed=0,
                overall_summary="",
                total_issues=0,
                critical_count=0,
                warning_count=0,
                overall_score=0,
                review_results=[],
                file_reviews=[]
            )
    
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
    
    def get_rule_by_name(self, rule_name: str) -> Dict[str, Any]:
        """Get a single rule by name with combined content"""
        try:
            rule = self.chroma_service.get_rule_by_name(rule_name)
            if rule:
                return {
                    "success": True,
                    "message": f"Retrieved rule '{rule_name}' successfully",
                    "rule": rule
                }
            else:
                return {
                    "success": False,
                    "message": f"Rule '{rule_name}' not found",
                    "rule": None
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error retrieving rule: {str(e)}",
                "rule": None
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
    
    def delete_rule_by_id(self, rule_id: str) -> Dict[str, Any]:
        """Delete a specific rule by its ID"""
        try:
            success = self.chroma_service.delete_rule_by_id(rule_id)
            if success:
                return {
                    "success": True,
                    "message": f"Rule with ID '{rule_id}' deleted successfully",
                    "rule_id": rule_id
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to delete rule with ID '{rule_id}'",
                    "rule_id": rule_id
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error deleting rule: {str(e)}",
                "rule_id": rule_id
            }
    
    def delete_rules_by_ids(self, rule_ids: List[str]) -> Dict[str, Any]:
        """Delete multiple rules by their IDs"""
        try:
            if not rule_ids:
                return {
                    "success": False,
                    "message": "No rule IDs provided",
                    "rule_ids": rule_ids
                }
            
            result = self.chroma_service.delete_rules_by_ids(rule_ids)
            return result
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Error deleting rules: {str(e)}",
                "rule_ids": rule_ids
            }
    
    def delete_rules_by_name(self, rule_name: str) -> Dict[str, Any]:
        """Delete all chunks of a rule by rule name"""
        try:
            success = self.chroma_service.delete_rules_by_name(rule_name)
            if success:
                return {
                    "success": True,
                    "message": f"All chunks of rule '{rule_name}' deleted successfully",
                    "rule_name": rule_name
                }
            else:
                return {
                    "success": False,
                    "message": f"Failed to delete rules with name '{rule_name}'",
                    "rule_name": rule_name
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error deleting rules: {str(e)}",
                "rule_name": rule_name
            }
  