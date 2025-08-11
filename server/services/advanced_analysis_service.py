from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage
from typing import Dict, List, Any
import json
import re
from config import Config
from services.prompt_service import PromptService

class AdvancedAnalysisService:
    """Service for advanced code analysis including security and performance"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=Config.MODEL_NAME,
            temperature=Config.TEMPERATURE,
            max_tokens=Config.MAX_TOKENS,
            api_key=Config.OPENAI_API_KEY
        )
        self.prompts = PromptService.get_prompts()
    
    def analyze_security(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code for security vulnerabilities"""
        try:
            # Get security analysis prompt
            prompt = self.prompts["security_analysis"].format(
                language=language,
                code=code
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            
            # Parse response
            security_data = self._parse_security_response(response.content)
            
            return {
                "success": True,
                "security_issues": security_data.get("security_issues", []),
                "total_vulnerabilities": len(security_data.get("security_issues", [])),
                "risk_levels": self._analyze_risk_levels(security_data.get("security_issues", [])),
                "summary": self._generate_security_summary(security_data.get("security_issues", []))
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Security analysis failed: {str(e)}",
                "security_issues": [],
                "total_vulnerabilities": 0,
                "risk_levels": {},
                "summary": "Security analysis could not be completed"
            }
    
    def analyze_performance(self, code: str, language: str) -> Dict[str, Any]:
        """Analyze code for performance issues and optimization opportunities"""
        try:
            # Get performance analysis prompt
            prompt = self.prompts["performance_analysis"].format(
                language=language,
                code=code
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            
            # Parse response
            performance_data = self._parse_performance_response(response.content)
            
            return {
                "success": True,
                "performance_issues": performance_data.get("performance_issues", []),
                "total_issues": len(performance_data.get("performance_issues", [])),
                "priority_levels": self._analyze_priority_levels(performance_data.get("performance_issues", [])),
                "summary": self._generate_performance_summary(performance_data.get("performance_issues", []))
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Performance analysis failed: {str(e)}",
                "performance_issues": [],
                "total_issues": 0,
                "priority_levels": {},
                "summary": "Performance analysis could not be completed"
            }
    
    def analyze_rule_compliance(self, rule_text: str, code_snippet: str) -> Dict[str, Any]:
        """Analyze how well code follows a specific rule"""
        try:
            # Get rule analysis prompt
            prompt = self.prompts["rule_analysis"].format(
                rule_text=rule_text,
                code_snippet=code_snippet
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            
            return {
                "success": True,
                "analysis": response.content.strip(),
                "rule_text": rule_text,
                "code_snippet": code_snippet
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Rule compliance analysis failed: {str(e)}",
                "analysis": "Analysis could not be completed",
                "rule_text": rule_text,
                "code_snippet": code_snippet
            }
    
    def comprehensive_analysis(self, code: str, language: str) -> Dict[str, Any]:
        """Perform comprehensive analysis including security, performance, and general review"""
        try:
            # Get code review prompt
            prompt = self.prompts["code_review"].format(
                language=language,
                rules_text="General coding best practices, security guidelines, and performance considerations",
                code=code
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            
            # Parse response
            review_data = self._parse_llm_response(response.content)
            
            # Perform additional analyses
            security_analysis = self.analyze_security(code, language)
            performance_analysis = self.analyze_performance(code, language)
            
            return {
                "success": True,
                "general_review": {
                    "issues": review_data.get("issues", []),
                    "total_issues": len(review_data.get("issues", [])),
                    "critical_count": sum(1 for issue in review_data.get("issues", []) if issue.get("type") == "critical"),
                    "warning_count": sum(1 for issue in review_data.get("issues", []) if issue.get("type") == "warning")
                },
                "security_analysis": security_analysis,
                "performance_analysis": performance_analysis,
                "overall_score": self._calculate_overall_score(
                    review_data.get("issues", []),
                    security_analysis.get("security_issues", []),
                    performance_analysis.get("performance_issues", [])
                )
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Comprehensive analysis failed: {str(e)}"
            }
    
    def _parse_security_response(self, response: str) -> Dict[str, Any]:
        """Parse security analysis response"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Fallback parsing
        return {"security_issues": []}
    
    def _parse_performance_response(self, response: str) -> Dict[str, Any]:
        """Parse performance analysis response"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Fallback parsing
        return {"performance_issues": []}
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse LLM response to extract structured data"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Fallback: try to extract information manually
        issues = []
        lines = response.split('\n')
        current_issue = {}
        
        for line in lines:
            line = line.strip()
            if line.startswith('Rule:') or line.startswith('Issue:'):
                if current_issue:
                    issues.append(current_issue)
                current_issue = {'rule': line.split(':', 1)[1].strip()}
            elif line.startswith('Description:'):
                current_issue['description'] = line.split(':', 1)[1].strip()
            elif line.startswith('Code:'):
                current_issue['code'] = line.split(':', 1)[1].strip()
            elif line.startswith('Suggestion:'):
                current_issue['suggestion'] = line.split(':', 1)[1].strip()
            elif line.startswith('Line:'):
                try:
                    current_issue['lineNumber'] = int(line.split(':', 1)[1].strip())
                except:
                    current_issue['lineNumber'] = 0
            elif line.startswith('Type:'):
                type_val = line.split(':', 1)[1].strip().lower()
                current_issue['type'] = 'critical' if 'critical' in type_val else 'warning'
        
        if current_issue:
            issues.append(current_issue)
        
        return {"issues": issues}
    
    def _analyze_risk_levels(self, security_issues: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze distribution of risk levels in security issues"""
        risk_levels = {"High": 0, "Medium": 0, "Low": 0}
        
        for issue in security_issues:
            risk_level = issue.get("risk_level", "Medium")
            if risk_level in risk_levels:
                risk_levels[risk_level] += 1
        
        return risk_levels
    
    def _analyze_priority_levels(self, performance_issues: List[Dict[str, Any]]) -> Dict[str, int]:
        """Analyze distribution of priority levels in performance issues"""
        priority_levels = {"High": 0, "Medium": 0, "Low": 0}
        
        for issue in performance_issues:
            priority = issue.get("priority", "Medium")
            if priority in priority_levels:
                priority_levels[priority] += 1
        
        return priority_levels
    
    def _generate_security_summary(self, security_issues: List[Dict[str, Any]]) -> str:
        """Generate summary of security analysis"""
        if not security_issues:
            return "✅ No security vulnerabilities detected. The code appears to follow security best practices."
        
        high_count = sum(1 for issue in security_issues if issue.get("risk_level") == "High")
        medium_count = sum(1 for issue in security_issues if issue.get("risk_level") == "Medium")
        low_count = sum(1 for issue in security_issues if issue.get("risk_level") == "Low")
        
        if high_count > 0:
            return f"🚨 {len(security_issues)} security vulnerabilities found: {high_count} High, {medium_count} Medium, {low_count} Low risk. Immediate attention required for high-risk issues."
        elif medium_count > 0:
            return f"⚠️ {len(security_issues)} security vulnerabilities found: {medium_count} Medium, {low_count} Low risk. Address medium-risk issues soon."
        else:
            return f"🔒 {len(security_issues)} low-risk security vulnerabilities found. Good security practices overall."
    
    def _generate_performance_summary(self, performance_issues: List[Dict[str, Any]]) -> str:
        """Generate summary of performance analysis"""
        if not performance_issues:
            return "⚡ No performance issues detected. The code appears to be well-optimized."
        
        high_count = sum(1 for issue in performance_issues if issue.get("priority") == "High")
        medium_count = sum(1 for issue in performance_issues if issue.get("priority") == "Medium")
        low_count = sum(1 for issue in performance_issues if issue.get("priority") == "Low")
        
        if high_count > 0:
            return f"🐌 {len(performance_issues)} performance issues found: {high_count} High, {medium_count} Medium, {low_count} Low priority. High-priority optimizations should be addressed first."
        elif medium_count > 0:
            return f"⏱️ {len(performance_issues)} performance issues found: {medium_count} Medium, {low_count} Low priority. Consider addressing medium-priority issues for better performance."
        else:
            return f"🚀 {len(performance_issues)} low-priority performance issues found. Code performance is generally good."
    
    def _calculate_overall_score(self, general_issues: List[Dict[str, Any]], 
                                security_issues: List[Dict[str, Any]], 
                                performance_issues: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate overall code quality score"""
        total_issues = len(general_issues) + len(security_issues) + len(performance_issues)
        
        # Weight different types of issues
        critical_weight = 3
        warning_weight = 1
        high_risk_weight = 3
        medium_risk_weight = 2
        low_risk_weight = 1
        
        # Calculate weighted score
        weighted_score = 0
        
        for issue in general_issues:
            if issue.get("type") == "critical":
                weighted_score += critical_weight
            else:
                weighted_score += warning_weight
        
        for issue in security_issues:
            risk_level = issue.get("risk_level", "Medium")
            if risk_level == "High":
                weighted_score += high_risk_weight
            elif risk_level == "Medium":
                weighted_score += medium_risk_weight
            else:
                weighted_score += low_risk_weight
        
        for issue in performance_issues:
            priority = issue.get("priority", "Medium")
            if priority == "High":
                weighted_score += high_risk_weight
            elif priority == "Medium":
                weighted_score += medium_risk_weight
            else:
                weighted_score += low_risk_weight
        
        # Convert to percentage (lower is better)
        max_possible_score = (len(general_issues) + len(security_issues) + len(performance_issues)) * critical_weight
        if max_possible_score > 0:
            quality_percentage = max(0, 100 - (weighted_score / max_possible_score) * 100)
        else:
            quality_percentage = 100
        
        # Determine grade
        if quality_percentage >= 90:
            grade = "A"
        elif quality_percentage >= 80:
            grade = "B"
        elif quality_percentage >= 70:
            grade = "C"
        elif quality_percentage >= 60:
            grade = "D"
        else:
            grade = "F"
        
        return {
            "percentage": round(quality_percentage, 1),
            "grade": grade,
            "total_issues": total_issues,
            "weighted_score": weighted_score,
            "max_possible_score": max_possible_score
        }
