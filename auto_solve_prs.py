import os
import sys
import json
import subprocess
import urllib.request
import urllib.error
import time

# Config
API_KEY = os.getenv("NVIDIA_API_KEY") or os.getenv("OPENAI_API_KEY")
is_openai = not os.getenv("NVIDIA_API_KEY") and os.getenv("OPENAI_API_KEY")

DEFAULT_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini" if is_openai else "nvidia/nemotron-3-ultra-550b-a55b")
DEFAULT_API_BASE = os.getenv("LLM_API_BASE", "https://api.openai.com/v1" if is_openai else "https://integrate.api.nvidia.com/v1")

def log(msg):
    print(f"[*] {msg}")

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, encoding="utf-8", errors="replace")
        return res.stdout.strip(), res.stderr.strip(), res.returncode
    except Exception as e:
        return "", str(e), 1

def query_llm(prompt, system_prompt):
    if not API_KEY:
        log("API KEY missing! Please set NVIDIA_API_KEY or OPENAI_API_KEY")
        sys.exit(1)
        
    url = f"{DEFAULT_API_BASE.rstrip('/')}/chat/completions"
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}
    data = {
        "model": DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 4096
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode("utf-8"))
            return res["choices"][0]["message"]["content"]
    except Exception as e:
        log(f"LLM Error: {e}")
        return ""

def find_files_for_issue(title):
    # Ask LLM which files are most likely related to this issue
    out, _, _ = run_cmd("git ls-tree -r master --name-only")
    files = out.split("\n")
    # filter out node_modules, build, etc
    files = [f for f in files if f.endswith(('.js', '.jsx', '.ts', '.tsx', '.json', '.md')) and not f.startswith('node_modules')]
    
    sys_prompt = "You are a repository assistant. Given the issue title and a list of files, return ONLY a JSON array of 1 to 3 file paths that most likely need to be edited to fix the issue."
    prompt = f"Issue Title: {title}\n\nFiles:\n{json.dumps(files)}"
    
    resp = query_llm(prompt, sys_prompt)
    try:
        if "```json" in resp:
            resp = resp.split("```json")[1].split("```")[0].strip()
        elif "```" in resp:
            resp = resp.split("```")[1].split("```")[0].strip()
        
        chosen = json.loads(resp)
        return chosen if isinstance(chosen, list) else []
    except:
        return []

def solve_issue(issue_num, issue_title):
    log(f"--- Solving Issue #{issue_num}: {issue_title} ---")
    branch_name = f"auto-fix-issue-{issue_num}"
    
    # 1. Checkout new branch
    run_cmd("git checkout master")
    run_cmd(f"git branch -D {branch_name}") # delete if exists locally
    run_cmd(f"git checkout -b {branch_name}")
    
    # 2. Find target files
    target_files = find_files_for_issue(issue_title)
    if not target_files:
        log("Could not determine which files to edit. Skipping.")
        return
    
    log(f"Target files identified: {target_files}")
    changes_made = False
    
    for filepath in target_files:
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, "r", encoding="utf-8") as f:
            original_code = f.read()
            
        # 3. Query LLM to fix the file
        log(f"Generating fix for {filepath}...")
        sys_prompt = "You are an expert AI coder. Output ONLY the completely updated code for the file with the fix applied. Do NOT output markdown formatting like ```javascript. Do NOT output any explanations."
        prompt = f"Fix this issue:\nTitle: {issue_title}\n\nFile: {filepath}\nOriginal Code:\n{original_code}"
        
        fixed_code = query_llm(prompt, sys_prompt)
        
        if fixed_code.startswith("```"):
            fixed_code = "\n".join(fixed_code.split("\n")[1:-1])
            
        if fixed_code and fixed_code != original_code and len(fixed_code) > 10:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(fixed_code)
            changes_made = True
            log(f"Applied fix to {filepath}")
            
    # 4. Commit, Push, and PR
    if changes_made:
        run_cmd("git add .")
        run_cmd(f'git commit -m "Fixes #{issue_num}: {issue_title}"')
        log("Pushing to remote...")
        run_cmd(f"git push -u origin {branch_name}")
        
        log("Creating PR...")
        pr_body = f"## 🚀 Description\nAutomated fix for #{issue_num}: {issue_title}.\n\nResolves #{issue_num}\n\n## 🛠️ Type of change\n- [x] Bug fix\n\n## ✅ Checklist\n- [x] Automated AI Fix"
        with open("pr_body.txt", "w", encoding="utf-8") as f:
            f.write(pr_body)
            
        out, err, code = run_cmd(f'gh pr create --title "Fixes #{issue_num}: {issue_title}" --body-file pr_body.txt --base master')
        if code == 0:
            log(f"✅ PR Created: {out.strip()}")
        else:
            log(f"❌ PR Creation Failed: {err}")
            
        if os.path.exists("pr_body.txt"):
            os.remove("pr_body.txt")
    else:
        log("No code changes were made by the LLM. Skipping PR.")
        run_cmd("git checkout master")

def main():
    log("Fetching all open issues authored by you...")
    out, err, code = run_cmd('gh issue list --author "sahare-mayur-0071" --state open --json number,title --limit 5')
    if code != 0:
        log(f"Failed to fetch issues: {err}")
        return
        
    try:
        issues = json.loads(out)
    except:
        issues = []
        
    log(f"Found {len(issues)} open issues.")
    
    for issue in issues:
        if str(issue["number"]) in ["9579", "9510", "9509", "9508", "9507", "9505"]:
            continue
        solve_issue(issue["number"], issue["title"])
        time.sleep(3) # Prevent rate limiting
        
    log("All issues processed!")

if __name__ == "__main__":
    # Ensure stdout uses utf-8
    sys.stdout.reconfigure(encoding='utf-8')
    main()
