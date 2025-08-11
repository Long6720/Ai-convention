# AI Code Review Agent

An intelligent AI-powered code review agent built with Python, LangGraph, and LangChain that can analyze code based on user-uploaded review rules.

## Features

- 🤖 **AI-Powered Code Review**: Uses OpenAI's GPT models for intelligent code analysis
- 📋 **Custom Rule Management**: Upload and manage custom coding standards and best practices
- 🔍 **Multi-Language Support**: Automatically detects and reviews code in various programming languages
- 📁 **GitHub PR Integration**: Review code directly from GitHub Pull Requests
- 💾 **Vector Database Storage**: Uses ChromaDB for efficient rule storage and retrieval
- 🚀 **FastAPI Backend**: Modern, fast REST API with automatic documentation
- 🔄 **LangGraph Workflow**: Structured AI workflow for consistent code review process
- 🔒 **Security Analysis**: Advanced security vulnerability detection and analysis
- ⚡ **Performance Analysis**: Performance optimization recommendations and analysis
- 📊 **Comprehensive Analysis**: Combined review with security, performance, and quality scoring
- 🎯 **PromptTemplate Management**: Centralized prompt management using LangChain PromptTemplate

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI       │    │   LangGraph     │    │   ChromaDB      │
│   Server        │◄──►│   Workflow      │◄──►│   Vector Store  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   OpenAI        │    │   Rule          │
│   Service       │    │   LLM           │    │   Management    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Installation

1. **Clone the repository and navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file in the server directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   CHROMA_PERSIST_DIRECTORY=./chroma_db
   MODEL_NAME=gpt-4
   TEMPERATURE=0.1
   MAX_TOKENS=4000
   ```

## Usage

### Starting the Server

```bash
python main.py
```

The server will start on `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### API Endpoints

#### Rule Management

- `POST /api/rules/upload` - Upload rules as text
- `POST /api/rules/upload-file` - Upload rules from file
- `GET /api/rules` - Get all rules
- `GET /api/rules/search?query=...` - Search rules
- `DELETE /api/rules` - Clear all rules

#### Code Review

- `POST /api/review/code` - Review code snippet (JSON)
- `POST /api/review/code-text` - Review code snippet (form data)
- `POST /api/review/github-pr` - Review GitHub PR

#### Advanced Analysis

- `POST /api/analysis/security` - Analyze code for security vulnerabilities
- `POST /api/analysis/performance` - Analyze code for performance issues
- `POST /api/analysis/comprehensive` - Perform comprehensive analysis
- `POST /api/analysis/rule-compliance` - Analyze rule compliance

### Example Usage

#### 1. Upload Coding Rules

```bash
curl -X POST "http://localhost:8000/api/rules/upload" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "rules_text=Use snake_case for variables&rule_name=Python Standards&description=Python coding standards"
```

#### 2. Review Code Snippet

```bash
curl -X POST "http://localhost:8000/api/review/code" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def hello_world():\n    print(\"Hello World\")",
    "language": "Python"
  }'
```

#### 3. Review GitHub PR

```bash
curl -X POST "http://localhost:8000/api/review/github-pr" \
  -H "Content-Type: application/json" \
  -d '{
    "pr_url": "https://github.com/username/repo/pull/123",
    "repository": "username/repo",
    "branch": "main"
  }'
```

## Testing

Run the test script to verify the system:

```bash
python test_agent.py
```

This will:
1. Upload sample coding rules
2. Review sample Python code
3. Test rule search functionality
4. Verify the complete workflow

## Code Review Output Format

The agent returns review results in the following JSON format:

```json
{
  "success": true,
  "message": "Code review completed successfully",
  "review_results": [
    {
      "rule": "Naming Convention",
      "description": "Variable should use snake_case",
      "code": "userName = 'John'",
      "suggestion": "Use snake_case: userName -> user_name",
      "lineNumber": 5,
      "type": "warning"
    }
  ],
  "summary": "🔍 Code review completed for Python code. Found 1 issue(s): 0 critical and 1 warnings.",
  "language_detected": "Python",
  "total_issues": 1,
  "critical_count": 0,
  "warning_count": 1
}
```

## Supported Languages

The agent can automatically detect and review code in:
- Python
- JavaScript/TypeScript
- Java
- C/C++
- C#
- PHP
- Ruby
- Go
- Rust
- Swift
- And many more...

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `CHROMA_PERSIST_DIRECTORY`: Directory for ChromaDB storage
- `MODEL_NAME`: OpenAI model to use (default: gpt-4)
- `TEMPERATURE`: LLM temperature for creativity (default: 0.1)
- `MAX_TOKENS`: Maximum tokens for LLM responses (default: 4000)

### LangGraph Workflow

The agent uses a 4-step workflow:
1. **Language Detection**: Automatically identify programming language
2. **Rule Search**: Find relevant rules from the knowledge base
3. **Code Analysis**: Analyze code against rules using AI
4. **Summary Generation**: Generate comprehensive review summary

## Development

### Project Structure

```
server/
├── main.py                 # FastAPI server
├── config.py              # Configuration management
├── models.py              # Pydantic models
├── requirements.txt       # Dependencies
├── requirements-dev.txt   # Development dependencies
├── test_agent.py         # Test script
├── demo.py                # API demo script
├── run.py                 # Server runner script
├── setup.sh               # Setup script (Linux/Mac)
├── setup.bat              # Setup script (Windows)
├── env.example            # Environment template
├── README.md              # This file
└── services/
    ├── __init__.py
    ├── main_service.py           # Main service orchestrator
    ├── code_review_service.py    # LangGraph workflow
    ├── chroma_service.py         # ChromaDB service
    ├── github_service.py         # GitHub integration
    ├── prompt_service.py         # PromptTemplate management
    └── advanced_analysis_service.py  # Security & performance analysis
```

### Adding New Features

1. **New Language Support**: Add patterns to `_detect_language()` in `code_review_service.py`
2. **Custom Rules**: Extend the rule format in `models.py`
3. **Additional Services**: Create new service files in the `services/` directory

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**: Ensure your API key is set in `.env`
2. **ChromaDB Connection**: Check if the `chroma_db` directory exists and is writable
3. **Import Errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`

### Logs

The server provides detailed logging. Check the console output for any error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
