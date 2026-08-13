import json
import os
import subprocess
import time

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def main():
    print("Fetching recent workflow runs...")
    stdout, stderr = run_command("gh run list --repo SandeepVashishtha/Eventra --limit 300 --json databaseId,status,conclusion,headBranch")
    try:
        runs = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing JSON: {e}\nstdout: {stdout}\nstderr: {stderr}")
        return

    failed_our_runs = []
    for run in runs:
        # Check if the run failed and belongs to one of our branches
        if run["status"] == "completed" and run["conclusion"] == "failure":
            branch = run["headBranch"]
            if branch and (branch.startswith("bugfix/issue-") or branch.startswith("feat/")):
                # Double check if it is our branch by checking if we have it locally
                # (our branches all start with bugfix/issue-)
                failed_our_runs.append(run)

    print(f"Found {len(failed_our_runs)} failed workflow runs on our branches.")
    
    for idx, run in enumerate(failed_our_runs):
        run_id = run["databaseId"]
        branch = run["headBranch"]
        print(f"[{idx+1}/{len(failed_our_runs)}] Rerunning workflow run {run_id} on branch {branch}...")
        
        rerun_stdout, rerun_stderr = run_command(f"gh run rerun {run_id} --repo SandeepVashishtha/Eventra")
        print(f"  Result: {rerun_stdout.strip()} {rerun_stderr.strip()}")
        
        # Sleep 2 seconds to avoid rate limiting ourselves
        time.sleep(2)

    print("All failed workflow runs have been requested to rerun!")

if __name__ == "__main__":
    main()
