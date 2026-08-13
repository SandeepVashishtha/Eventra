with open(r"C:\Users\User\.gemini\antigravity\brain\e2fd6446-6fbe-4315-9153-ddd6bb53cfa5\.system_generated\tasks\task-1308.log", "r", encoding="utf-8") as f:
    for line in f:
        if "HttpError" in line or "Error:" in line or "status" in line or "failed" in line or "Request failed" in line:
            print(line.strip())
