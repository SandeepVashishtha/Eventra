import json
import subprocess
import time

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def main():
    print("Fetching open PRs...")
    stdout, stderr = run_command("gh pr list --author ashroxy --limit 100 --json number,title")
    try:
        prs = json.loads(stdout)
    except Exception as e:
        print("Failed to parse PR list:", e)
        print("STDOUT:", stdout)
        print("STDERR:", stderr)
        return
        
    print(f"Found {len(prs)} open Pull Requests to close.")
    
    for idx, pr in enumerate(prs):
        num = pr["number"]
        title = pr["title"]
        print(f"[{idx+1}/{len(prs)}] Closing PR #{num}: {title}...")
        
        ok_cmd = f"gh pr close {num} --delete-branch"
        stdout_c, stderr_c = run_command(ok_cmd)
        if "Closed pull request" in stdout_c or "Closed pull request" in stderr_c or "already closed" in stderr_c:
            print(f"Successfully closed PR #{num}")
        else:
            print(f"Failed to close PR #{num}: {stderr_c.strip()} {stdout_c.strip()}")
            
        time.sleep(2)  # Pacing to avoid hitting rate limits

    print("Finished closing all open PRs!")

if __name__ == "__main__":
    main()
