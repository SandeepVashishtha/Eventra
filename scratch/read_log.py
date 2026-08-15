import json

log_path = r"C:\Users\User\.gemini\antigravity\brain\e2fd6446-6fbe-4315-9153-ddd6bb53cfa5\.system_generated\logs\transcript.jsonl"
with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        if "gh pr create" in line:
            print(line[:500])
