import json
import subprocess
import time
import re

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def get_pr_info(pr_number):
    stdout, stderr = run_command(f"gh pr view {pr_number} --repo SandeepVashishtha/Eventra --json headRefName")
    try:
        data = json.loads(stdout)
        return data["headRefName"]
    except Exception as e:
        print(f"Error getting PR {pr_number} info: {e}")
        return None

def main():
    # The 30 PRs we created
    # Let's find all open PRs by ashroxy
    print("Fetching open PRs for ashroxy...")
    stdout, stderr = run_command("gh pr list --author ashroxy --state open --limit 100 --json number,headRefName")
    try:
        prs = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing PR list: {e}")
        return
        
    print(f"Found {len(prs)} open PRs.")
    
    for idx, pr in enumerate(prs):
        pr_number = pr["number"]
        branch = pr["headRefName"]
        
        print(f"\n[{idx+1}/{len(prs)}] Checking checks for PR #{pr_number} (Branch: {branch})...")
        checks_stdout, checks_stderr = run_command(f"gh pr checks {pr_number} --repo SandeepVashishtha/Eventra")
        
        # Check if there is any failure
        if "fail" in checks_stdout or "fail" in checks_stderr:
            print(f"PR #{pr_number} has failed checks! Triggering rerun via empty commit...")
            
            # Switch to branch
            run_command(f"git checkout {branch}")
            # Pull to make sure we are clean
            run_command(f"git pull origin {branch}")
            # Empty commit
            run_command('git commit --allow-empty -m "trigger workflow rerun"')
            # Push
            push_stdout, push_stderr = run_command(f"git push origin {branch}")
            print(f"Pushed empty commit: {push_stdout.strip()} {push_stderr.strip()}")
            
            # Sleep to respect GitHub push rate limits
            time.sleep(5)
        else:
            print(f"PR #{pr_number} has all passing or pending checks.")

    # Return to master
    run_command("git checkout master")
    print("\nWorkflow reruns triggered successfully!")

if __name__ == "__main__":
    main()
