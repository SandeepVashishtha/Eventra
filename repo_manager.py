#!/usr/bin/env python3
import os
import sys
import json
import subprocess
import argparse
from datetime import datetime, timezone
import urllib.request
import urllib.error

# Configurable defaults
DEFAULT_MODEL = os.getenv("LLM_MODEL", "nvidia/nemotron-3-ultra-550b-a55b")
DEFAULT_API_BASE = os.getenv("LLM_API_BASE", "https://integrate.api.nvidia.com/v1")
API_KEY = os.getenv("NVIDIA_API_KEY") or os.getenv("OPENAI_API_KEY")

def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

def run_cmd(cmd):
    """Helper to run a shell command and return stdout, stderr, and code."""
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, encoding="utf-8", errors="replace", check=True)
        return res.stdout.strip() if res.stdout else "", res.stderr.strip() if res.stderr else "", res.returncode
    except subprocess.CalledProcessError as e:
        return e.stdout.strip() if e.stdout else "", e.stderr.strip() if e.stderr else "", e.returncode


def query_llm(prompt, system_prompt="You are a helpful GitHub repository manager assistant."):
    """Send a request to the LLM API using standard library urllib to avoid dependencies."""
    if not API_KEY:
        log("Warning: No NVIDIA_API_KEY or OPENAI_API_KEY found. In dry-run/mock mode.")
        return "MOCK_RESPONSE: AI key is missing. Please configure NVIDIA_API_KEY or OPENAI_API_KEY."

    url = f"{DEFAULT_API_BASE.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    data = {
        "model": DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 1024
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            return res_json["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        log(f"HTTP Error querying LLM: {e.code} - {err_msg}")
        return f"Error: LLM API returned HTTP {e.code}."
    except Exception as e:
        log(f"Unexpected error querying LLM: {e}")
        return f"Error: {str(e)}"

# --- WORKFLOW 1: SPAM & DUPLICATE CHECK ---
def check_duplicate_or_spam(issue_id, dry_run=False):
    log(f"Checking issue #{issue_id} for duplicate or spam...")
    
    # 1. Fetch current issue details
    out, err, code = run_cmd(f"gh issue view {issue_id} --json title,body,author")
    if code != 0:
        log(f"Error viewing issue #{issue_id}: {err}")
        return
    
    issue_data = json.loads(out)
    title = issue_data.get("title", "")
    body = issue_data.get("body", "")
    author = issue_data.get("author", {}).get("login", "unknown")
    
    # 2. Fetch last 50 issues to compare for duplicates
    out_list, err_list, code_list = run_cmd("gh issue list --limit 50 --json number,title,state")
    if code_list != 0:
        log(f"Error fetching issues list: {err_list}")
        recent_issues = []
    else:
        recent_issues = json.loads(out_list)
    
    # Filter out the current issue from the comparison list
    comparison_issues = [iss for iss in recent_issues if str(iss["number"]) != str(issue_id)]
    
    # 3. Prompt LLM to evaluate duplicate and spam
    system_prompt = (
        "You are an expert repository moderator. Analyze the issue title and body below. "
        "Evaluate: \n"
        "1. If it is SPAM (meaningless gibberish, advertisements, random text, off-topic, or empty description).\n"
        "2. If it is a DUPLICATE of any recent issues listed.\n\n"
        "Format your response as a valid JSON object with the following keys:\n"
        "- is_spam (boolean)\n"
        "- is_duplicate (boolean)\n"
        "- duplicate_issue_number (integer or null if not duplicate)\n"
        "- reasoning (string explaining the verdict)\n"
        "- custom_comment (string: a polite comment to post on the issue if it is spam or duplicate)"
    )
    
    prompt = f"""
Current Issue:
Number: #{issue_id}
Author: @{author}
Title: {title}
Body:
{body}

---
Recent Issues for Duplicate check:
{json.dumps(comparison_issues, indent=2)}
"""
    
    response_text = query_llm(prompt, system_prompt)
    log(f"LLM Response:\n{response_text}")
    
    # Parse LLM response
    try:
        # Extract JSON from potential markdown code fences
        cleaned_response = response_text.strip()
        if "```json" in cleaned_response:
            cleaned_response = cleaned_response.split("```json")[1].split("```")[0].strip()
        elif "```" in cleaned_response:
            cleaned_response = cleaned_response.split("```")[1].split("```")[0].strip()
            
        result = json.loads(cleaned_response)
    except Exception as e:
        log(f"Failed to parse LLM JSON: {e}. Fallback to safe non-moderated status.")
        return

    is_spam = result.get("is_spam", False)
    is_duplicate = result.get("is_duplicate", False)
    reasoning = result.get("reasoning", "")
    comment = result.get("custom_comment", "")
    
    if is_spam:
        log(f"Issue #{issue_id} classified as SPAM: {reasoning}")
        if dry_run:
            log(f"[DRY-RUN] Comment to post: {comment}")
            log(f"[DRY-RUN] Label issue as 'spam' and close it.")
        else:
            # Comment, label, and close
            run_cmd(f'gh issue comment {issue_id} --body "{comment}"')
            run_cmd(f'gh issue edit {issue_id} --add-label "spam"')
            run_cmd(f'gh issue close {issue_id}')
            log(f"Issue #{issue_id} successfully closed as spam.")
            
    elif is_duplicate:
        dup_num = result.get("duplicate_issue_number")
        log(f"Issue #{issue_id} classified as DUPLICATE of #{dup_num}: {reasoning}")
        if dry_run:
            log(f"[DRY-RUN] Comment to post: {comment}")
            log(f"[DRY-RUN] Label issue as 'duplicate' and close it.")
        else:
            run_cmd(f'gh issue comment {issue_id} --body "{comment}"')
            run_cmd(f'gh issue edit {issue_id} --add-label "duplicate"')
            run_cmd(f'gh issue close {issue_id}')
            log(f"Issue #{issue_id} successfully closed as duplicate.")
    else:
        log(f"Issue #{issue_id} is valid and clean.")

# --- WORKFLOW 2: PR CODE REVIEW ---
def review_pr(pr_id, dry_run=False):
    log(f"Reviewing PR #{pr_id}...")
    
    # 1. Fetch PR Diff and metadata
    diff_out, diff_err, diff_code = run_cmd(f"gh pr diff {pr_id}")
    if diff_code != 0:
        log(f"Error fetching PR diff: {diff_err}")
        return
        
    meta_out, meta_err, meta_code = run_cmd(f"gh pr view {pr_id} --json title,body,author")
    if meta_code != 0:
        log(f"Error fetching PR metadata: {meta_err}")
        return
        
    meta_data = json.loads(meta_out)
    title = meta_data.get("title", "")
    body = meta_data.get("body", "")
    author = meta_data.get("author", {}).get("login", "unknown")
    
    # Keep diff under a reasonable limit to fit context window
    if len(diff_out) > 30000:
        diff_out = diff_out[:30000] + "\n\n... [Diff truncated due to size] ..."
        
    system_prompt = (
        "You are an elite software engineer and code reviewer. Analyze the PR details and git diff provided. "
        "Provide a structured, constructive review focused on:\n"
        "1. Code correctness and potential bugs\n"
        "2. Performance optimizations\n"
        "3. Security vulnerabilities\n"
        "4. Code quality/styling guidelines compliance\n\n"
        "Output your review in markdown format. Be polite, objective, and reference specific line changes if necessary. "
        "At the end of your review, include a line with exactly 'Recommendation: APPROVED' if the PR is ready to merge without any changes. "
        "Otherwise, use 'Recommendation: REQUEST_CHANGES' or 'Recommendation: COMMENT'."
    )
    
    prompt = f"""
PR Title: {title}
PR Author: @{author}
PR Description:
{body}

---
Git Diff:
```diff
{diff_out}
```
"""
    
    review_markdown = query_llm(prompt, system_prompt)
    log(f"Generated PR Review:\n{review_markdown}")
    
    is_approved = "Recommendation: APPROVED" in review_markdown
    
    if dry_run:
        log(f"[DRY-RUN] Commenting review on PR #{pr_id}")
        if is_approved:
            log(f"[DRY-RUN] PR is ready to merge. Label as 'EVENTRA:APPROVED'.")
    else:
        # Post the review comment
        review_file = f"temp_pr_review_{pr_id}.md"
        with open(review_file, "w", encoding="utf-8") as f:
            f.write(review_markdown)
        run_cmd(f"gh pr comment {pr_id} --body-file {review_file}")
        if os.path.exists(review_file):
            os.remove(review_file)
            
        if is_approved:
            log(f"PR #{pr_id} is approved! Adding 'EVENTRA:APPROVED' label.")
            run_cmd(f'gh pr edit {pr_id} --add-label "EVENTRA:APPROVED"')
            
        log(f"PR #{pr_id} successfully reviewed!")

# --- WORKFLOW 3: ISSUE ASSIGNMENT & RESOLUTION CONTEST ---
def manage_assignments_and_resolutions(dry_run=False):
    log("Managing issue assignments and checking active resolutions...")
    
    # 1. Fetch all open issues that are assigned
    out, err, code = run_cmd("gh issue list --state open --json number,title,assignees")
    if code != 0:
        log(f"Error fetching open issues: {err}")
        return
        
    issues = json.loads(out)
    
    for iss in issues:
        iss_num = iss["number"]
        assignees = iss.get("assignees", [])
        if not assignees:
            continue
            
        assignee_names = [a["login"] for a in assignees]
        log(f"Checking assigned issue #{iss_num} ('{iss['title']}') - assigned to {assignee_names}")
        
        # 2. Fetch all pull requests related to this issue
        # GitHub convention: PR description references "Fixes #123" or "Closes #123"
        pr_out, pr_err, pr_code = run_cmd(f"gh pr list --state open --json number,title,body,author")
        if pr_code != 0:
            log(f"Error fetching open PRs: {pr_err}")
            continue
            
        open_prs = json.loads(pr_out)
        resolving_prs = []
        for pr in open_prs:
            body = pr.get("body", "") or ""
            # Search for mentions like "Fixes #123" or similar variants
            if f"#{iss_num}" in body or f"issue {iss_num}" in body.lower():
                resolving_prs.append(pr)
                
        if len(resolving_prs) > 1:
            log(f"Found multiple open PRs resolving issue #{iss_num}: {[pr['number'] for pr in resolving_prs]}")
            evaluate_resolution_contest(iss_num, resolving_prs, dry_run)
        else:
            # Check for staleness/cooldown: if assignee hasn't created a PR or commented within 48h
            check_stale_assignment(iss_num, assignee_names, dry_run)

def check_stale_assignment(issue_id, assignees, dry_run=False):
    # Fetch recent timeline/comments to check activity
    out, err, code = run_cmd(f"gh issue view {issue_id} --json comments,createdAt")
    if code != 0:
        return
        
    data = json.loads(out)
    comments = data.get("comments", [])
    
    # Find latest comment or activity from the assignees
    last_assignee_activity = None
    for comment in reversed(comments):
        author = comment.get("author", {}).get("login")
        if author in assignees:
            last_assignee_activity = comment.get("createdAt")
            break
            
    if not last_assignee_activity:
        # Fallback to issue creation if no comments
        last_assignee_activity = data.get("createdAt")
        
    if last_assignee_activity:
        try:
            # Parse datetime format e.g., '2026-06-17T10:00:00Z'
            dt = datetime.strptime(last_assignee_activity, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            delta = now - dt
            # Cooldown unassign after 48 hours of inactivity
            if delta.days >= 2:
                log(f"Assignees {assignees} have been inactive for {delta.days} days on #{issue_id}. Unassigning...")
                comment_text = (
                    f"Hi @{', @'.join(assignees)}, this issue has had no updates or activity for over 48 hours. "
                    "To keep the project moving, I am unassigning you to let other contributors take it. "
                    "Thank you for your interest! 🙏"
                )
                if dry_run:
                    log(f"[DRY-RUN] Unassign from #{issue_id} and comment: {comment_text}")
                else:
                    run_cmd(f'gh issue comment {issue_id} --body "{comment_text}"')
                    for assignee in assignees:
                        run_cmd(f'gh issue edit {issue_id} --remove-assignee "{assignee}"')
        except Exception as e:
            log(f"Error parsing date or unassigning: {e}")

def evaluate_resolution_contest(issue_id, pull_requests, dry_run=False):
    """Compare multiple open PRs that resolve the same issue and recommend the best one."""
    log(f"Evaluating resolution contest for issue #{issue_id}...")
    
    pr_details = []
    for pr in pull_requests:
        num = pr["number"]
        diff_out, _, _ = run_cmd(f"gh pr diff {num}")
        # Truncate diff if needed
        if len(diff_out) > 15000:
            diff_out = diff_out[:15000] + "\n... [Diff truncated] ..."
            
        pr_details.append({
            "number": num,
            "title": pr["title"],
            "author": pr.get("author", {}).get("login", "unknown"),
            "description": pr.get("body", ""),
            "diff": diff_out
        })
        
    system_prompt = (
        "You are an expert repository manager. Multiple contributors have submitted PRs targeting the same issue. "
        "Your task is to analyze their implementations and recommend which PR is the best resolution.\n"
        "Evaluate on:\n"
        "1. Correctness: Does it solve the problem cleanly?\n"
        "2. Performance: Is the solution efficient?\n"
        "3. Robustness/Testing: Are there unit/integration tests?\n"
        "4. Code style and quality: Is the code clean and well-structured?\n\n"
        "Provide a markdown summary comparison, and clearly declare a recommended WINNING PR with a short explanation. "
        "Be very polite and appreciative to all contributors, emphasizing that all submissions are highly valued."
    )
    
    prompt = f"""
Issue: #{issue_id}
Target Resolution Contest Pull Requests:
{json.dumps(pr_details, indent=2)}
"""
    
    comparison_markdown = query_llm(prompt, system_prompt)
    log(f"Comparison Result:\n{comparison_markdown}")
    
    if dry_run:
        log(f"[DRY-RUN] Post comparison to issue #{issue_id}")
    else:
        run_cmd(f'gh issue comment {issue_id} --body "{comparison_markdown}"')
        log(f"Contest evaluation commented on issue #{issue_id}!")

# --- CLI ARGUMENT PARSING ---
def main():
    parser = argparse.ArgumentParser(description="AI Repository Manager Bot")
    parser.add_argument("--action", required=True, choices=["check-spam", "review-pr", "check-resolutions", "manage-assignments"],
                        help="Action to perform")
    parser.add_argument("--issue", type=int, help="Issue ID (required for check-spam and check-resolutions)")
    parser.add_argument("--pr", type=int, help="PR ID (required for review-pr)")
    parser.add_argument("--dry-run", action="store_true", help="Run in dry-run mode without modifying GitHub state")
    
    args = parser.parse_args()
    
    if args.action == "check-spam":
        if not args.issue:
            parser.error("--issue is required for action check-spam")
        check_duplicate_or_spam(args.issue, args.dry_run)
        
    elif args.action == "review-pr":
        if not args.pr:
            parser.error("--pr is required for action review-pr")
        review_pr(args.pr, args.dry_run)
        
    elif args.action == "check-resolutions":
        if not args.issue:
            parser.error("--issue is required for action check-resolutions")
        # Fetch PRs matching this issue
        pr_out, pr_err, pr_code = run_cmd("gh pr list --state open --json number,title,body,author")
        if pr_code == 0:
            open_prs = json.loads(pr_out)
            resolving_prs = [pr for pr in open_prs if f"#{args.issue}" in (pr.get("body", "") or "") or f"issue {args.issue}" in (pr.get("body", "") or "").lower()]
            if resolving_prs:
                evaluate_resolution_contest(args.issue, resolving_prs, args.dry_run)
            else:
                log(f"No active PRs found resolving issue #{args.issue}")
        else:
            log(f"Error checking resolutions: {pr_err}")
            
    elif args.action == "manage-assignments":
        manage_assignments_and_resolutions(args.dry_run)

if __name__ == "__main__":
    main()
