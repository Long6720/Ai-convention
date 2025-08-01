import os
import openai
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file (if used)
load_dotenv()

# Configuration
API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://aiportalapi.stu-platform.live/use")
MODEL = "GPT-4.1"
TEMPERATURE = 0.2

# Initialize OpenAI client
client = OpenAI(
    api_key=API_KEY,
    base_url=BASE_URL
)

# JavaScript code to check
javascript_code = """
function myfunction() {
let name='John';
console.log("hello " + name);
}
"""

# Prompt template
prompt = f"""
You are an expert JavaScript code reviewer.
Check the following code for JavaScript naming conventions, spacing, indentation, semicolons, and general best practices.
Suggest corrections if needed.

Code:
{javascript_code}
"""

# Send request to OpenAI
try:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a JavaScript style and convention checker."},
            {"role": "user", "content": prompt}
        ],
        temperature=TEMPERATURE
    )

    # Output result
    print(response.choices[0].message.content)

except Exception as e:
    print("Error:", e)
