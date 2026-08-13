import json
import subprocess

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout, res.stderr

def main():
    stdout, _ = run_command("gh run list --repo SandeepVashishtha/Eventra --limit 150 --json databaseId,status,conclusion,headBranch,headSha,event")
    try:
        runs = json.loads(stdout)
    except Exception as e:
        print(f"Error parsing JSON: {e}")
        return

    print("Last 30 workflow runs:")
    for run in runs[:30]:
        print(f"Branch: {run['headBranch']} | Event: {run['event']} | Status: {run['status']} | Conclusion: {run['conclusion']}")

if __name__ == "__main__":
    main()
