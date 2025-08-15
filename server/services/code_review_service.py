from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from typing import Dict, List, Any, TypedDict
import json
import re
from config import Config
from services.chroma_service import ChromaService
from services.prompt_service import PromptService

class CodeReviewState(TypedDict):
    code: str
    language: str
    rules: List[Dict[str, Any]]
    review_results: List[Dict[str, Any]]
    positive_aspects: List[str]
    recommendations: List[str]
    overall_assessment: Dict[str, Any]
    current_step: str
    summary: str
    overall_score: int
    total_issues: int
    critical_count: int
    warning_count: int

class CodeReviewService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=Config.MODEL_NAME,
            temperature=Config.TEMPERATURE,
            max_tokens=Config.MAX_TOKENS,
            api_key=Config.OPENAI_API_KEY,
            base_url="https://aiportalapi.stu-platform.live/jpe",
        )
        self.chroma_service = ChromaService()
        self.prompts = self._create_prompts()
        self.graph = self._build_graph()
    
    def _create_prompts(self) -> Dict[str, any]:
        """Create and return all prompt templates using PromptService"""
        return PromptService.get_prompts()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow for code review"""
        workflow = StateGraph(CodeReviewState)
        
        # Add nodes
        workflow.add_node("detect_language", self._detect_language)
        workflow.add_node("search_rules", self._search_relevant_rules)
        workflow.add_node("analyze_code", self._analyze_code)
        workflow.add_node("generate_summary", self._generate_summary)
        
        # Set entry point
        workflow.set_entry_point("detect_language")
        
        # Add edges
        workflow.add_edge("detect_language", "search_rules")
        workflow.add_edge("search_rules", "analyze_code")
        workflow.add_edge("analyze_code", "generate_summary")
        workflow.add_edge("generate_summary", END)
        
        return workflow.compile()
    
    def _detect_language(self, state: CodeReviewState) -> CodeReviewState:
        """Detect programming language from code using AI"""
        code = state["code"]
        
        try:
            # Use AI to detect language
            prompt = self.prompts["language_detection"].format(code=code)
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            detected_language = response.content.strip()
            
            # Fallback to pattern-based detection if AI fails
            if not detected_language or detected_language.lower() == "unknown":
                detected_language = self._fallback_language_detection(code)
            
            # Normalize language name for consistency
            detected_language = self._normalize_language_name(detected_language)
            
            state["language"] = detected_language
            state["current_step"] = "language_detected"
            
        except Exception as e:
            # Fallback to pattern-based detection
            detected_language = self._fallback_language_detection(code)
            detected_language = self._normalize_language_name(detected_language)
            state["language"] = detected_language
            state["current_step"] = "language_detected"
        
        return state
    
    def _normalize_language_name(self, language: str) -> str:
        """Normalize language names for consistency"""
        language = language.strip()
        
        # Common variations
        language_mapping = {
            "typescript": "TypeScript",
            "ts": "TypeScript",
            "javascript": "JavaScript",
            "js": "JavaScript",
            "python": "Python",
            "py": "Python",
            "java": "Java",
            "cpp": "C++",
            "c++": "C++",
            "c#": "C#",
            "csharp": "C#",
            "c": "C"
        }
        
        normalized = language_mapping.get(language.lower(), language)
        return normalized
    
    def _fallback_language_detection(self, code: str) -> str:
        """Fallback language detection using pattern matching"""
        language_patterns = {
            "Python": [
                r"def\s+\w+\s*\(", r"import\s+\w+", r"from\s+\w+\s+import",
                r"class\s+\w+", r"if\s+__name__\s*==\s*['\"]__main__['\"]",
                r"print\s*\(", r"return\s+", r"elif\s+", r"else\s*:"
            ],
            "JavaScript": [
                r"function\s+\w+\s*\(", r"const\s+\w+", r"let\s+\w+", r"var\s+\w+",
                r"console\.log", r"export\s+", r"import\s+", r"=>\s*{",
                r"\.forEach\s*\(", r"\.map\s*\(", r"\.filter\s*\("
            ],
            "TypeScript": [
                r"interface\s+\w+", r"type\s+\w+", r":\s*\w+", r"<T>",
                r"function\s+\w+<", r"const\s+\w+:\s*\w+", r"Partial<\w+>",
                r"Array<\w+>", r"Promise<\w+>", r"enum\s+\w+", r"extends\s+\w+",
                r"implements\s+\w+", r"public\s+", r"private\s+", r"protected\s+",
                r"abstract\s+class", r"namespace\s+\w+", r"declare\s+"
            ],
            "Java": [
                r"public\s+class\s+\w+", r"public\s+static\s+void\s+main",
                r"import\s+java\.", r"System\.out\.println", r"private\s+\w+",
                r"protected\s+\w+", r"final\s+\w+", r"throws\s+\w+"
            ],
            "C++": [
                r"#include\s*<", r"using\s+namespace\s+std", r"std::",
                r"int\s+main\s*\(", r"cout\s*<<", r"cin\s*>>", r"vector<\w+>",
                r"template\s*<", r"class\s+\w+\s*{", r"public:", r"private:"
            ],
            "C#": [
                r"using\s+System", r"namespace\s+\w+", r"public\s+class\s+\w+",
                r"Console\.WriteLine", r"var\s+\w+", r"string\s+\w+", r"int\s+\w+",
                r"List<\w+>", r"Dictionary<\w+,\w+>", r"async\s+Task"
            ]
        }
        
        detected_language = "Unknown"
        max_matches = 0
        
        for lang, patterns in language_patterns.items():
            matches = sum(1 for pattern in patterns if re.search(pattern, code))
            if matches > max_matches:
                max_matches = matches
                detected_language = lang
        
        return detected_language
    
    def _search_relevant_rules(self, state: CodeReviewState) -> CodeReviewState:
        """Search for relevant rules based on code and language"""
        code = state["code"]
        language = state["language"]
        
        # Create search query
        query = f"code review rules for {language} programming language"
        if language != "Unknown":
            query += f" {language} best practices coding standards"
        
        try:
            # Search in ChromaDB
            relevant_rules = self.chroma_service.search_rules(query, n_results=10)
            
            # Also search for general coding rules
            general_query = "general coding standards best practices"
            general_rules = self.chroma_service.search_rules(general_query, n_results=5)
            
            # Combine and deduplicate
            all_rules = relevant_rules + general_rules
            unique_rules = []
            seen_contents = set()
            
            for rule in all_rules:
                # Use 'content' instead of 'document' for the new combined format
                rule_content = rule.get('content', '')
                rule_name = rule.get('rule_name', 'Unknown')
                
                if rule_content and rule_content not in seen_contents:
                    unique_rules.append(rule)
                    seen_contents.add(rule_content)
                else:
                    pass # No debug print for skipping duplicates
            
            state["rules"] = unique_rules[:10]  # Limit to top 10
            state["current_step"] = "rules_found"
            
        except Exception as e:
            state["rules"] = []
            state["current_step"] = "rules_error"
        
        return state
    
    def _analyze_code(self, state: CodeReviewState) -> CodeReviewState:
        """Analyze code against the rules and generate review results"""
        code = state["code"]
        language = state["language"]
        rules = state["rules"]
        
        try:
            # Prepare context for LLM - use 'content' instead of 'document'
            rules_text = "\n\n".join([rule.get('content', '') for rule in rules])
            
            # Use PromptTemplate for code review
            prompt = self.prompts["code_review"].format(
                language=language,
                rules_text=rules_text,
                code=code
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            
            # Parse LLM response
            review_data = self._parse_llm_response(response.content)
            
            state["review_results"] = review_data.get("issues", [])
            state["positive_aspects"] = review_data.get("good_points", [])
            # Ensure overall_score is a number, not a list
            overall_score = review_data.get("overall_score", 0)
            if isinstance(overall_score, list):
                overall_score = overall_score[0] if overall_score else 0
            elif not isinstance(overall_score, (int, float)):
                overall_score = 0
            state["overall_score"] = overall_score
            state["recommendations"] = review_data.get("recommendations", [])
            state["overall_assessment"] = review_data.get("overall_assessment", {})
            state["current_step"] = "analysis_complete"
            
        except Exception as e:
            state["review_results"] = []
            state["current_step"] = "analysis_error"
        
        return state
    
    def _generate_summary(self, state: CodeReviewState) -> CodeReviewState:
        """Generate a summary of the review results using AI"""
        review_results = state["review_results"]
        language = state["language"]
        
        # Count issues by type
        critical_count = sum(1 for issue in review_results if issue.get("type") == "critical")
        warning_count = sum(1 for issue in review_results if issue.get("type") == "warning")
        total_issues = len(review_results)
        
        try:
            # Use AI to generate summary
            prompt = self.prompts["summary_generation"].format(
                language=language,
                total_issues=total_issues,
                critical_count=critical_count,
                warning_count=warning_count
            )
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            summary = response.content.strip()
            
            # Fallback to template-based summary if AI fails
            if not summary or len(summary) < 10:
                summary = self._fallback_summary_generation(language, total_issues, critical_count, warning_count)
                
        except Exception as e:
            # Fallback to template-based summary
            summary = self._fallback_summary_generation(language, total_issues, critical_count, warning_count)
        
        state["summary"] = summary
        state["total_issues"] = total_issues
        state["critical_count"] = critical_count
        state["warning_count"] = warning_count
        state["current_step"] = "complete"
        
        return state
    
    def _fallback_summary_generation(self, language: str, total_issues: int, critical_count: int, warning_count: int) -> str:
        """Fallback summary generation using templates"""
        if total_issues == 0:
            return f"✅ Excellent! No issues found in the {language} code. The code follows best practices and coding standards."
        else:
            summary = f"🔍 Code review completed for {language} code. Found {total_issues} issue(s): {critical_count} critical and {warning_count} warnings."
            
            if critical_count > 0:
                summary += f" ⚠️ {critical_count} critical issue(s) should be addressed immediately."
            
            if warning_count > 0:
                summary += f" 💡 {warning_count} warning(s) are recommendations for improvement."
            
            return summary
    
    def _parse_llm_response(self, response: str) -> Dict[str, Any]:
        """Parse the LLM response to extract structured data"""
        
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                return parsed
        except json.JSONDecodeError as e:
            pass
        
        # Fallback: try to extract information manually
        issues = []
        lines = response.split('\n')
        current_issue = {}
        
        for line in lines:
            line = line.strip()
            if line.startswith('Title:'):
                if current_issue:
                    issues.append(current_issue)
                try:
                    current_issue = {'title': line.split(':', 1)[1].strip()}
                except IndexError:
                    current_issue = {'title': line}
            elif line.startswith('Rule:') or line.startswith('Issue:'):
                if current_issue:
                    issues.append(current_issue)
                try:
                    current_issue = {'rule': line.split(':', 1)[1].strip()}
                except IndexError:
                    current_issue = {'rule': line}
            elif line.startswith('Description:'):
                try:
                    current_issue['description'] = line.split(':', 1)[1].strip()
                except IndexError:
                    current_issue['description'] = line
            elif line.startswith('Code:'):
                try:
                    current_issue['code'] = line.split(':', 1)[1].strip()
                except IndexError:
                    current_issue['code'] = line
            elif line.startswith('Suggestion:'):
                try:
                    current_issue['suggestion'] = line.split(':', 1)[1].strip()
                except IndexError:
                    current_issue['suggestion'] = line
            elif line.startswith('Line:'):
                try:
                    current_issue['lineNumber'] = int(line.split(':', 1)[1].strip())
                except (IndexError, ValueError):
                    current_issue['lineNumber'] = 0
            elif line.startswith('Type:'):
                try:
                    type_val = line.split(':', 1)[1].strip().lower()
                    current_issue['type'] = 'critical' if 'critical' in type_val else 'warning'
                except (IndexError, AttributeError):
                    current_issue['type'] = 'warning'
        
        if current_issue:
            issues.append(current_issue)
        
        return {
            "issues": issues,
            "good_points": [],
            "recommendations": [],
            "overall_assessment": {}
        }
    
    def review_code(self, code: str, language: str = None) -> Dict[str, Any]:
        """Main method to review code"""
        initial_state = CodeReviewState(
            code=code,
            language=language or "Unknown",
            rules=[],
            review_results=[],
            positive_aspects=[],
            recommendations=[],
            good_points=[],
            overall_assessment={},
            current_step="started",
            summary="",
            overall_score=0,
            total_issues=0,
            critical_count=0,
            warning_count=0
        )
        
        try:
            final_state = self.graph.invoke(initial_state)
            
            return {
                "success": True,
                "message": "Code review completed successfully",
                "review_results": final_state["review_results"],
                "positive_aspects": final_state.get("positive_aspects", []),
                "recommendations": final_state.get("recommendations", []),
                "overall_assessment": final_state.get("overall_assessment", {}),
                "summary": final_state["summary"],
                "language_detected": final_state["language"],
                "total_issues": final_state["total_issues"],
                "overall_score": final_state["overall_score"],
                "critical_count": final_state["critical_count"],
                "warning_count": final_state["warning_count"]
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error during code review: {str(e)}",
                "review_results": [],
                "positive_aspects": [],
                "recommendations": [],
                "overall_assessment": {},
                "summary": "Code review failed due to an error",
                "language_detected": language or "Unknown",
                "overall_score": 0,
                "total_issues": 0,
                "critical_count": 0,
                "warning_count": 0
            }
