import json
import subprocess
import time
import sys

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def main():
    print("Fetching open PRs for ashroxy...")
    stdout, stderr = run_command("gh pr list --author ashroxy --state open --limit 100 --json number,headRefName")
    try:
        prs = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing JSON: {e}\nstdout: {stdout}\nstderr: {stderr}")
        return
        
    print(f"Found {len(prs)} open PRs.")
    
    for idx, pr in enumerate(prs):
        number = pr["number"]
        branch = pr["headRefName"]
        print(f"\n--- [{idx+1}/{len(prs)}] Checking PR #{number} (Branch: {branch}) ---")
        
        # 1. Checkout and reset branch to origin
        run_command("git rebase --abort") # abort any previous rebase if stuck
        run_command(f"git checkout {branch}")
        run_command(f"git reset --hard origin/{branch}")
        
        # 2. Try rebasing on upstream/master
        print(f"Rebasing {branch} on upstream/master...")
        rb_stdout, rb_stderr = run_command("git rebase upstream/master")
        
        if "CONFLICT" in rb_stdout or "CONFLICT" in rb_stderr:
            print(f"Conflict detected on branch {branch}!")
            print("Status:")
            st_stdout, _ = run_command("git status")
            print(st_stdout)
            
            # Since we resolved 15568 manually, let's see if we can abort and let the model know,
            # or try to auto-resolve if possible.
            run_command("git rebase --abort")
            print(f"Aborted rebase for branch {branch} due to conflict.")
        elif "Successfully rebased" in rb_stdout or "is up to date" in rb_stdout:
            print(f"Rebased successfully. Pushing to origin...")
            push_stdout, push_stderr = run_command(f"git push origin {branch} --force")
            if "forced update" in push_stdout or "forced update" in push_stderr or "up to date" in push_stdout:
                print(f"Successfully updated PR #{number} / branch {branch}")
            else:
                print(f"Push response: {push_stdout} {push_stderr}")
        else:
            print(f"Unexpected rebase output: {rb_stdout} {rb_stderr}")
            
        time.sleep(3)

if __name__ == "__main__":
    main()
