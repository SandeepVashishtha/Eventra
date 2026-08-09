import assert from "node:assert/strict";
import {
  resolveHackathonResourceAction,
} from "../src/utils/hackathonResourceUtils.js";

{
  const missing = resolveHackathonResourceAction(null);
  assert.equal(missing.available, false);
  assert.equal(missing.label, "Unavailable");
}

{
  const noUrl = resolveHackathonResourceAction({
    name: "Organizer Handbook.pdf",
    type: "PDF",
    size: "2.4 MB",
    url: null,
  });
  assert.equal(noUrl.available, false);
  assert.equal(noUrl.label, "Unavailable");
  assert.match(noUrl.message, /Organizer Handbook\.pdf/);
  assert.match(noUrl.message, /not available/i);
}

{
  const blankUrl = resolveHackathonResourceAction({
    name: "Empty.url",
    type: "PDF",
    url: "   ",
  });
  assert.equal(blankUrl.available, false);
}

{
  const file = resolveHackathonResourceAction({
    name: "API_Starter_Boilerplates.zip",
    type: "ZIP",
    url: "https://example.com/starter.zip",
  });
  assert.equal(file.available, true);
  assert.equal(file.label, "Fetch File");
  assert.equal(file.url, "https://example.com/starter.zip");
}

{
  const external = resolveHackathonResourceAction({
    name: "Eventra Discord Invite Link",
    type: "External Link",
    url: "https://discord.gg/example",
  });
  assert.equal(external.available, true);
  assert.equal(external.label, "Open Link");
}

{
  const video = resolveHackathonResourceAction({
    name: "Devpost submission tutorial",
    type: "Video Link",
    url: "https://example.com/tutorial",
  });
  assert.equal(video.available, true);
  assert.equal(video.label, "Open Link");
}

console.log("hackathonResourceUtils tests passed");
