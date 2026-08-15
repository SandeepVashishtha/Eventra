import json
import subprocess
import time

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def main():
    print("Fetching open PRs for ashroxy...")
    stdout, stderr = run_command("gh pr list --author ashroxy --state open --limit 100 --json number")
    try:
        prs = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing JSON output: {e}\nstdout: {stdout}\nstderr: {stderr}")
        return
        
    print(f"Found {len(prs)} open PRs.")
    
    for idx, pr in enumerate(prs):
        pr_number = pr["number"]
        print(f"[{idx+1}/{len(prs)}] Commenting on PR #{pr_number}...")
        comment_body = "cc @TheSkylancer @SandeepVashishtha"
        cmd = f"gh pr comment {pr_number} --body \"{comment_body}\""
        comment_stdout, comment_stderr = run_command(cmd)
        if "github.com" in comment_stdout or "github.com" in comment_stderr:
            print(f"Successfully commented on PR #{pr_number}")
        else:
            print(f"Warning/Error on PR #{pr_number}: {comment_stdout.strip()} {comment_stderr.strip()}")
        
        # Sleep to prevent API rate limits
        time.sleep(5)
        
    print("Done commenting on all open PRs.")

if __name__ == "__main__":
    main()
