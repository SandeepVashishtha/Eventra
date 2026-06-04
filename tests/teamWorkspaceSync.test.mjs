import assert from "node:assert/strict";
import syncHandler from "../api/hackathons/team/sync.js";
import tasksHandler from "../api/hackathons/team/tasks.js";
import announcementsHandler from "../api/hackathons/team/announcements.js";
import chatHandler from "../api/hackathons/team/chat.js";
import { teamTasks, teamPins, teamChatHistory, sseClients } from "../api/db/teamStore.js";

// Helper to create mock response
const createResponse = () => {
  const headers = {};
  return {
    statusCode: 200,
    body: null,
    headers,
    writtenData: [],
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(key, value) {
      if (typeof key === "object") {
        Object.assign(this.headers, key);
      } else {
        this.headers[key] = value;
      }
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    writeHead(code, newHeaders) {
      this.statusCode = code;
      Object.assign(this.headers, newHeaders);
      return this;
    },
    write(data) {
      this.writtenData.push(data);
      return this;
    },
    end(data) {
      if (data) {
        try {
          this.body = JSON.parse(data);
        } catch {
          this.body = data;
        }
      }
      return this;
    },
  };
};

const createRequest = (method, body = {}, headers = {}) => {
  return {
    method,
    body,
    headers,
    on(event, callback) {
      if (event === "close") {
        this.closeCallback = callback;
      }
    },
  };
};

console.log("Running Team Workspace Real-Time Sync tests...");

// Test 1: sync.js GET handler (SSE registration & initial snapshot)
{
  const req = createRequest("GET");
  const res = createResponse();
  
  await syncHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["Content-Type"], "text/event-stream");
  assert.ok(sseClients.has(res));
  assert.equal(res.writtenData.length, 1);
  
  const parsedData = JSON.parse(res.writtenData[0].replace("data: ", "").trim());
  assert.equal(parsedData.type, "init");
  assert.ok(Array.isArray(parsedData.tasks));
  assert.ok(Array.isArray(parsedData.pins));
  assert.ok(Array.isArray(parsedData.chat));
  
  // Clean up
  sseClients.delete(res);
}

// Test 2: sync.js POST handler (Short-polling fallback)
{
  const req = createRequest("POST");
  const res = createResponse();
  
  await syncHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers["Content-Type"], "application/json");
  assert.ok(res.body.tasks);
  assert.ok(res.body.pins);
  assert.ok(res.body.chat);
}

// Test 3: tasks.js POST handler (Add action)
{
  const originalLength = teamTasks.length;
  const req = createRequest("POST", { action: "add", text: "New Test Task" });
  const res = createResponse();
  
  await tasksHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(teamTasks.length, originalLength + 1);
  const added = teamTasks[teamTasks.length - 1];
  assert.equal(added.text, "New Test Task");
  assert.equal(added.done, false);
}

// Test 4: tasks.js POST handler (Toggle action)
{
  const targetTask = teamTasks[0];
  const originalDone = targetTask.done;
  const req = createRequest("POST", { action: "toggle", id: targetTask.id });
  const res = createResponse();
  
  await tasksHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(targetTask.done, !originalDone);
}

// Test 5: tasks.js POST handler (Delete action)
{
  const targetTask = teamTasks[teamTasks.length - 1];
  const originalLength = teamTasks.length;
  const req = createRequest("POST", { action: "delete", id: targetTask.id });
  const res = createResponse();
  
  await tasksHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(teamTasks.length, originalLength - 1);
  assert.ok(!teamTasks.find(t => t.id === targetTask.id));
}

// Test 6: announcements.js POST handler (Add action)
{
  const originalLength = teamPins.length;
  const req = createRequest("POST", { action: "add", text: "New Pin Note", tag: "Deadline" });
  const res = createResponse();
  
  await announcementsHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(teamPins.length, originalLength + 1);
  const added = teamPins[0]; // Pins are unshifted
  assert.equal(added.text, "New Pin Note");
  assert.equal(added.tag, "Deadline");
}

// Test 7: announcements.js POST handler (Delete action)
{
  const targetPin = teamPins[0];
  const originalLength = teamPins.length;
  const req = createRequest("POST", { action: "delete", id: targetPin.id });
  const res = createResponse();
  
  await announcementsHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(teamPins.length, originalLength - 1);
  assert.ok(!teamPins.find(p => p.id === targetPin.id));
}

// Test 8: chat.js POST handler (Add message)
{
  const originalLength = teamChatHistory.length;
  const req = createRequest("POST", { text: "Hello Team", sender: "Sophia" });
  const res = createResponse();
  
  await chatHandler(req, res);
  
  assert.equal(res.statusCode, 200);
  assert.equal(teamChatHistory.length, originalLength + 1);
  const added = teamChatHistory[teamChatHistory.length - 1];
  assert.equal(added.text, "Hello Team");
  assert.equal(added.sender, "Sophia");
}

console.log("✓ All Team Workspace Sync tests passed successfully!");
