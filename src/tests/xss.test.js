import DOMPurify from "dompurify";

describe("XSS Sanitization for Event Descriptions", () => {
  it("should strip script tags", () => {
    const html = "Normal text <script>alert(1)</script>";
    const sanitized = DOMPurify.sanitize(html);

    expect(sanitized).toContain("Normal text");
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("alert(1)");
  });

  it("should neutralize javascript: links", () => {
    const html = "<a href=\"javascript:alert('XSS')\">Click me</a>";
    const sanitized = DOMPurify.sanitize(html);

    expect(sanitized).not.toContain("javascript:alert");
  });

  it("should strip onerror handlers", () => {
    const html = '<img src="invalid.jpg" onerror="alert(1)" />';
    const sanitized = DOMPurify.sanitize(html);

    expect(sanitized).toContain('<img src="invalid.jpg">');
    expect(sanitized).not.toContain("onerror");
  });
});
