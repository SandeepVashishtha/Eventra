import json
import subprocess

def run_command(command):
    res = subprocess.run(command, shell=True, capture_output=True, text=True)
    return res.stdout

def main():
    print("Fetching your open PRs...")
    stdout = run_command("gh pr list --author ashroxy --limit 100 --json number,title,labels")
    try:
        prs = json.loads(stdout)
    except Exception as e:
        print("Failed to parse PR list:", e)
        return
        
    print(f"Total open PRs: {len(prs)}")
    
    missing_critical = []
    missing_exceptional = []
    has_both = 0
    
    for pr in prs:
        num = pr["number"]
        title = pr["title"]
        labels = [l["name"].lower() for l in pr.get("labels", [])]
        
        has_crit = "level:critical" in labels
        has_exc = "quality:exceptional" in labels
        
        if has_crit and has_exc:
            has_both += 1
        else:
            if not has_crit:
                missing_critical.append((num, title, labels))
            if not has_exc:
                missing_exceptional.append((num, title, labels))
                
    print(f"\nSummary:")
    print(f"- PRs with BOTH labels: {has_both}")
    print(f"- PRs missing 'level:critical': {len(missing_critical)}")
    for num, title, labels in missing_critical:
        print(f"  #{num}: {title} (labels: {labels})")
        
    print(f"- PRs missing 'quality:exceptional': {len(missing_exceptional)}")
    for num, title, labels in missing_exceptional:
        print(f"  #{num}: {title} (labels: {labels})")

if __name__ == "__main__":
    main()
