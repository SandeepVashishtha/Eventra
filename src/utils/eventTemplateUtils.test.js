import {
  getTemplates,
  saveTemplate,
  loadTemplate,
  deleteTemplate,
  clearAllTemplates,
  templateNameExists,
} from "./eventTemplateUtils";

const TEMPLATES_KEY = "eventra_event_templates";

const sampleFormData = {
  title: "Tech Conference",
  description: "Annual tech event",
  date: "2026-09-01",
  location: "Remote",
  banner: "upload.png",       // excluded field
  eventId: "evt-123",          // excluded field
  createdBy: "admin",          // excluded field
};

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// getTemplates
// ---------------------------------------------------------------------------

describe("getTemplates", () => {
  it("returns empty array when no templates are stored", () => {
    expect(getTemplates()).toEqual([]);
  });

  it("returns stored templates", () => {
    const data = [{ id: "t1", name: "T1", createdAt: new Date().toISOString(), data: {} }];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(data));
    expect(getTemplates()).toHaveLength(1);
  });

  it("returns empty array when stored value is corrupt JSON", () => {
    localStorage.setItem(TEMPLATES_KEY, "not-json");
    expect(getTemplates()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveTemplate — duplicate name guard (issue #7039)
// ---------------------------------------------------------------------------

describe("saveTemplate — duplicate name guard", () => {
  it("saves a template and returns the created object", () => {
    const result = saveTemplate("My Template", sampleFormData);
    expect(result).not.toBeNull();
    expect(result.name).toBe("My Template");
    expect(result.id).toMatch(/^template_/);
  });

  it("returns null and warns when name is empty", () => {
    const result = saveTemplate("", sampleFormData);
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalled();
  });

  it("returns null and warns when name is only whitespace", () => {
    const result = saveTemplate("   ", sampleFormData);
    expect(result).toBeNull();
  });

  it("prevents saving a second template with the same name", () => {
    saveTemplate("My Template", sampleFormData);
    const result = saveTemplate("My Template", { title: "Different" });
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("already exists")
    );
  });

  it("prevents saving with a duplicate name regardless of leading/trailing spaces", () => {
    saveTemplate("My Template", sampleFormData);
    // name with surrounding spaces should still be detected as duplicate after trim
    const result = saveTemplate("  My Template  ", { title: "Other" });
    expect(result).toBeNull();
  });

  it("allows saving templates with distinct names", () => {
    const t1 = saveTemplate("Template A", sampleFormData);
    const t2 = saveTemplate("Template B", sampleFormData);
    expect(t1).not.toBeNull();
    expect(t2).not.toBeNull();
    expect(getTemplates()).toHaveLength(2);
  });

  it("duplicate check is case-insensitive", () => {
    saveTemplate("my template", sampleFormData);
    const result = saveTemplate("MY TEMPLATE", sampleFormData);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// saveTemplate — excluded fields
// ---------------------------------------------------------------------------

describe("saveTemplate — field sanitization", () => {
  it("strips excluded fields (banner, eventId, createdBy, etc.) from saved data", () => {
    const result = saveTemplate("Clean Template", sampleFormData);
    expect(result.data.banner).toBeUndefined();
    expect(result.data.eventId).toBeUndefined();
    expect(result.data.createdBy).toBeUndefined();
  });

  it("preserves non-excluded fields", () => {
    const result = saveTemplate("Full Template", sampleFormData);
    expect(result.data.title).toBe("Tech Conference");
    expect(result.data.description).toBe("Annual tech event");
    expect(result.data.location).toBe("Remote");
  });
});

// ---------------------------------------------------------------------------
// saveTemplate — generateTemplateId uses substring not substr (issue #7039)
// ---------------------------------------------------------------------------

describe("saveTemplate — generated ID format", () => {
  it("generates an ID starting with 'template_'", () => {
    const result = saveTemplate("ID Test", sampleFormData);
    expect(result.id).toMatch(/^template_\d+_[a-z0-9]+$/);
  });

  it("generates unique IDs for different templates", () => {
    const t1 = saveTemplate("T1", sampleFormData);
    // Need a tiny delay to ensure Date.now() differs; mock it
    const originalDateNow = Date.now;
    Date.now = jest.fn().mockReturnValue(originalDateNow() + 1);
    const t2 = saveTemplate("T2", sampleFormData);
    Date.now = originalDateNow;
    expect(t1.id).not.toBe(t2.id);
  });
});

// ---------------------------------------------------------------------------
// loadTemplate
// ---------------------------------------------------------------------------

describe("loadTemplate", () => {
  it("returns the template data for an existing ID", () => {
    const saved = saveTemplate("Loadable", sampleFormData);
    const loaded = loadTemplate(saved.id);
    expect(loaded).toBeTruthy();
    expect(loaded.title).toBe("Tech Conference");
  });

  it("returns null for a non-existent ID", () => {
    const loaded = loadTemplate("nonexistent");
    expect(loaded).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deleteTemplate
// ---------------------------------------------------------------------------

describe("deleteTemplate", () => {
  it("deletes an existing template and returns true", () => {
    const saved = saveTemplate("Deletable", sampleFormData);
    expect(deleteTemplate(saved.id)).toBe(true);
    expect(getTemplates()).toHaveLength(0);
  });

  it("returns false when template ID is not found", () => {
    expect(deleteTemplate("ghost-id")).toBe(false);
  });

  it("allows re-saving with the same name after deletion", () => {
    const saved = saveTemplate("Reusable Name", sampleFormData);
    deleteTemplate(saved.id);
    const reused = saveTemplate("Reusable Name", sampleFormData);
    expect(reused).not.toBeNull();
    expect(reused.name).toBe("Reusable Name");
  });
});

// ---------------------------------------------------------------------------
// clearAllTemplates
// ---------------------------------------------------------------------------

describe("clearAllTemplates", () => {
  it("removes all templates and returns true", () => {
    saveTemplate("T1", sampleFormData);
    saveTemplate("T2", { title: "Other" });
    expect(clearAllTemplates()).toBe(true);
    expect(getTemplates()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// templateNameExists
// ---------------------------------------------------------------------------

describe("templateNameExists", () => {
  it("returns true when a template with that name exists", () => {
    saveTemplate("Exists", sampleFormData);
    expect(templateNameExists("Exists")).toBe(true);
  });

  it("returns false when no template with that name exists", () => {
    expect(templateNameExists("Ghost")).toBe(false);
  });

  it("is case-insensitive", () => {
    saveTemplate("CaseSensitive", sampleFormData);
    expect(templateNameExists("casesensitive")).toBe(true);
    expect(templateNameExists("CASESENSITIVE")).toBe(true);
  });
});
