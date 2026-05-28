import os
import subprocess
import requests
import json
import sys
import re

def run_cmd(cmd, check=True, capture_output=True):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, check=False, capture_output=capture_output, text=True)
    if check and result.returncode != 0:
        print(f"Error running {' '.join(cmd)}\n{result.stderr}")
        raise Exception(f"Command failed: {' '.join(cmd)}")
    return result

def get_open_prs():
    # Detect current repo
    res_current = run_cmd(['gh', 'repo', 'view', '--json', 'nameWithOwner,parent'])
    repo_info = json.loads(res_current.stdout)
    current_repo = repo_info['nameWithOwner']
    
    # Check if there is an upstream parent
    if repo_info.get('parent'):
        target_repo = f"{repo_info['parent']['owner']['login']}/{repo_info['parent']['name']}"
    else:
        target_repo = current_repo
        
    print(f"Target repository for PRs: {target_repo}")
    
    res = run_cmd(['gh', 'pr', 'list', '--repo', target_repo, '--author', '@me', '--state', 'open', '--json', 'number,headRefName,headRepositoryOwner,baseRefName'])
    prs = json.loads(res.stdout)
    
    # Filter PRs that originate from our fork
    my_prs = [pr for pr in prs if pr.get('headRepositoryOwner') and pr['headRepositoryOwner']['login'] == current_repo.split('/')[0]]
    return target_repo, my_prs

def resolve_with_ai(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    prompt = f"""You are an expert developer resolving a Git merge conflict.
Below is the content of the file `{file_path}` which contains Git conflict markers (<<<<<<< HEAD, =======, >>>>>>>).
Your task is to resolve the conflict logically and provide ONLY the final, merged file content.
Do NOT include markdown code blocks like ```javascript or ``` in your response, just the raw code.
Make sure all conflict markers are removed and the logic integrates cleanly.

File Content:
{content}
"""
    
    groq_key = os.environ.get("GROQ_API_KEY")
    chatgpt_key = os.environ.get("CHATGPT_API_KEY") or os.environ.get("OPENAI_API_KEY")
    
    if groq_key:
        api_url = "https://api.groq.com/openai/v1/chat/completions"
        api_key = groq_key
        model = "llama3-70b-8192"
    elif chatgpt_key:
        api_url = "https://api.openai.com/v1/chat/completions"
        api_key = chatgpt_key
        model = "gpt-4-turbo"
    else:
        raise Exception("Neither GROQ_API_KEY nor CHATGPT_API_KEY/OPENAI_API_KEY found in environment.")
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }
    
    response = requests.post(api_url, headers=headers, json=data)
    response.raise_for_status()
    result_text = response.json()['choices'][0]['message']['content']
    
    # Clean up potential markdown formatting
    result_text = re.sub(r'^```[a-zA-Z]*\n', '', result_text)
    result_text = re.sub(r'\n```$', '', result_text)
    
    with open(file_path, 'w') as f:
        f.write(result_text)
    
    print(f"Resolved {file_path} using {model}")

def process_pr(pr, target_repo):
    pr_number = pr['number']
    branch = pr['headRefName']
    base = pr['baseRefName']
    print(f"Processing PR #{pr_number}: {branch} -> {base}")
    
    # Add upstream remote if not exists to fetch base branch
    run_cmd(['git', 'remote', 'add', 'upstream', f'https://github.com/{target_repo}.git'], check=False)
    run_cmd(['git', 'fetch', 'upstream'])
    
    # Reset repo state
    run_cmd(['git', 'reset', '--hard', 'HEAD'])
    run_cmd(['git', 'clean', '-fd'])
    
    # Checkout branch
    run_cmd(['git', 'checkout', branch])
    run_cmd(['git', 'pull', 'origin', branch])
    
    # Try merge
    print(f"Attempting merge with upstream/{base}")
    merge_result = run_cmd(['git', 'merge', f'upstream/{base}'], check=False)
    
    if merge_result.returncode == 0:
        print(f"PR #{pr_number} merged cleanly or is up to date.")
        return
        
    # We have conflicts
    print(f"Conflicts detected in PR #{pr_number}")
    diff_result = run_cmd(['git', 'diff', '--name-only', '--diff-filter=U'])
    conflicting_files = diff_result.stdout.strip().split('\n')
    
    if not conflicting_files or not conflicting_files[0]:
        print("Could not parse conflicting files. Aborting.")
        run_cmd(['git', 'merge', '--abort'], check=False)
        return
        
    for file_path in conflicting_files:
        print(f"Resolving conflict in: {file_path}")
        resolve_with_ai(file_path)
        run_cmd(['git', 'add', file_path])
        
    print("Committing resolved files")
    run_cmd(['git', 'commit', '--no-edit', '-m', f"🤖 AI automatically resolved merge conflicts from {base}"])
    
    print(f"Pushing resolved code to {branch}")
    run_cmd(['git', 'push', 'origin', branch])

def main():
    run_cmd(['git', 'config', '--global', 'user.name', 'github-actions[bot]'])
    run_cmd(['git', 'config', '--global', 'user.email', 'github-actions[bot]@users.noreply.github.com'])
    run_cmd(['git', 'fetch', '--all'])
    
    target_repo, prs = get_open_prs()
    if not prs:
        print("No open PRs found.")
        return
        
    for pr in prs:
        try:
            process_pr(pr, target_repo)
        except Exception as e:
            print(f"Failed to process PR #{pr['number']}: {e}")
            run_cmd(['git', 'merge', '--abort'], check=False)

if __name__ == "__main__":
    main()
