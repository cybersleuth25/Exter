import requests
import PyPDF2
import os
from dotenv import load_dotenv

# Load environment variables (to get GITHUB_TOKEN)
load_dotenv()

def fetch_github_code(repo_url):
    """
    Fetches code files from a GitHub repo.
    Features: Authentication, Recursion, and Safety Limits.
    """
    try:
        # 1. Clean and Parse URL
        # Converts "https://github.com/user/repo" -> "user", "repo"
        parts = repo_url.strip("/").split("/")
        if len(parts) < 2:
            return "Error: Invalid GitHub URL format."
            
        owner, repo = parts[-2], parts[-1]
        api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
        
        # 2. Setup Authentication (Crucial for Private Repos & Rate Limits)
        token = os.getenv("GITHUB_TOKEN")
        headers = {}
        if token:
            headers['Authorization'] = f'token {token}'
            print("--- AUTHENTICATION: Using GitHub Token ---")
        else:
            print("--- WARNING: No GitHub Token found. Rate limits may apply. ---")

        # 3. Fetching Logic
        code_content = ""
        allowed_extensions = {'.py', '.js', '.java', '.cpp', '.html', '.css', '.ts', '.jsx'}
        file_count = 0
        MAX_FILES = 2  # Stop after 5 files to prevent server crash

        def get_files(url):
            nonlocal code_content, file_count
            if file_count >= MAX_FILES: return

            try:
                response = requests.get(url, headers=headers)
                
                if response.status_code == 200:
                    items = response.json()
                    for item in items:
                        if file_count >= MAX_FILES: break
                        
                        if item['type'] == 'file':
                             # Check file extension
                             ext = os.path.splitext(item['name'])[1]
                             if ext in allowed_extensions:
                                # Fetch the actual raw text content
                                file_resp = requests.get(item['download_url'], headers=headers)
                                
                                code_content += f"\n\n--- FILE: {item['path']} ---\n"
                                code_content += file_resp.text
                                file_count += 1
                                print(f"Downloaded: {item['name']}")
                        
                        elif item['type'] == 'dir':
                            # Recursively check inside folders
                            get_files(item['url'])
                
                elif response.status_code == 401:
                    print("!!! ERROR: GitHub Token is INVALID. Check .env file.")
                elif response.status_code == 403:
                    print("!!! ERROR: GitHub API Rate Limit Exceeded.")
                elif response.status_code == 404:
                    print("!!! ERROR: Repo not found (or private).")
                    
            except Exception as e:
                print(f"Error reading URL {url}: {e}")

        # Start the recursive fetch
        get_files(api_url)
        
        # Return results
        if code_content == "":
            return "No valid code files found (checked .py, .js, .java, etc)."
            
        return code_content

    except Exception as e:
        print(f"GitHub Global Error: {e}")
        return f"Error fetching GitHub: {str(e)}"

def extract_pdf_text(pdf_file_stream):
    """
    Extracts text from an uploaded PDF file stream.
    """
    text = ""
    try:
        reader = PyPDF2.PdfReader(pdf_file_stream)
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"