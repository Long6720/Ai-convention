from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Optional
import json

from models import (
    CodeReviewRequest, 
    GitHubPRRequest, 
    RuleUploadRequest,
    CodeReviewResponse
)
from services.main_service import MainService

app = FastAPI(
    title="AI Code Review Agent",
    description="An AI-powered code review agent using LangGraph and LangChain",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize main service
main_service = MainService()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Code Review Agent API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Code Review Agent"}

@app.post("/api/rules/upload", response_model=dict)
async def upload_rules(
    rules_text: str = Form(...),
    rule_name: str = Form(...),
    description: str = Form(...)
):
    """Upload new review rules to the system"""
    try:
        request = RuleUploadRequest(
            rules_text=rules_text,
            rule_name=rule_name,
            description=description
        )
        
        result = main_service.upload_rules(request)
        
        if result["success"]:
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=400)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading rules: {str(e)}")

@app.post("/api/rules/upload-file")
async def upload_rules_file(
    file: UploadFile = File(...),
    rule_name: str = Form(...),
    description: str = Form(...)
):
    """Upload review rules from a text file"""
    try:
        if not file.filename.endswith(('.txt', '.md', '.rst')):
            raise HTTPException(status_code=400, detail="File must be a text file (.txt, .md, .rst)")
        
        content = await file.read()
        rules_text = content.decode("utf-8")
        
        request = RuleUploadRequest(
            rules_text=rules_text,
            rule_name=rule_name,
            description=description
        )
        
        result = main_service.upload_rules(request)
        
        if result["success"]:
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=400)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading rules file: {str(e)}")

@app.get("/api/rules")
async def get_rules():
    """Get all uploaded rules"""
    try:
        result = main_service.get_all_rules()
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving rules: {str(e)}")

@app.get("/api/rules/search")
async def search_rules(query: str, n_results: int = 10):
    """Search for specific rules"""
    try:
        result = main_service.search_rules(query, n_results)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching rules: {str(e)}")

@app.delete("/api/rules")
async def clear_rules():
    """Clear all rules from the system"""
    try:
        result = main_service.clear_rules()
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing rules: {str(e)}")

@app.post("/api/analysis/security")
async def analyze_security(
    code: str = Form(...),
    language: Optional[str] = Form(None)
):
    """Analyze code for security vulnerabilities"""
    try:
        result = main_service.analyze_security(code, language)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during security analysis: {str(e)}")

@app.post("/api/analysis/performance")
async def analyze_performance(
    code: str = Form(...),
    language: Optional[str] = Form(None)
):
    """Analyze code for performance issues"""
    try:
        result = main_service.analyze_performance(code, language)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during performance analysis: {str(e)}")

@app.post("/api/analysis/comprehensive")
async def comprehensive_analysis(
    code: str = Form(...),
    language: Optional[str] = Form(None)
):
    """Perform comprehensive code analysis"""
    try:
        result = main_service.comprehensive_analysis(code, language)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during comprehensive analysis: {str(e)}")

@app.post("/api/analysis/rule-compliance")
async def analyze_rule_compliance(
    rule_text: str = Form(...),
    code_snippet: str = Form(...)
):
    """Analyze how well code follows a specific rule"""
    try:
        result = main_service.analyze_rule_compliance(rule_text, code_snippet)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during rule compliance analysis: {str(e)}")

@app.post("/api/review/code", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    """Review a code snippet"""
    try:
        result = main_service.review_code_snippet(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during code review: {str(e)}")

@app.post("/api/review/github-pr")
async def review_github_pr(request: GitHubPRRequest):
    """Review code from a GitHub PR"""
    try:
        result = main_service.review_github_pr(request)
        
        if result["success"]:
            return JSONResponse(content=result, status_code=200)
        else:
            return JSONResponse(content=result, status_code=400)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during GitHub PR review: {str(e)}")

@app.post("/api/review/code-text")
async def review_code_text(
    code: str = Form(...),
    language: Optional[str] = Form(None),
    file_path: Optional[str] = Form(None)
):
    """Review code from text input"""
    try:
        request = CodeReviewRequest(
            code=code,
            language=language,
            file_path=file_path
        )
        
        result = main_service.review_code_snippet(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during code review: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
