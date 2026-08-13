package com.eventra.service;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SvgSanitizationServiceTest {

    private final SvgSanitizationService sanitizer = new SvgSanitizationService();

    private String sanitize(String svg) {
        byte[] out = sanitizer.sanitizeSvgContent(svg.getBytes(StandardCharsets.UTF_8));
        return new String(out, StandardCharsets.UTF_8);
    }

    @Test
    void keepsPlainSafeSvg() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\">"
                + "<rect x=\"1\" y=\"1\" width=\"5\" height=\"5\" fill=\"red\"/></svg>";
        String out = assertDoesNotThrow(() -> sanitize(svg));
        assertTrue(out.contains("rect"));
        assertTrue(out.contains("fill=\"red\""));
    }

    @Test
    void stripsScriptElements() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script>"
                + "<rect width=\"5\" height=\"5\"/></svg>";
        String out = sanitize(svg);
        assertFalse(out.toLowerCase().contains("script"));
        assertFalse(out.toLowerCase().contains("alert"));
    }

    @Test
    void stripsEventHandlers() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(1)\">"
                + "<rect width=\"5\" height=\"5\" onclick=\"alert(2)\"/></svg>";
        String out = sanitize(svg);
        assertFalse(out.contains("onload"));
        assertFalse(out.contains("onclick"));
        assertFalse(out.contains("alert"));
    }

    @Test
    void stripsEntityEncodedJavascriptUri() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" "
                + "xmlns:xlink=\"http://www.w3.org/1999/xlink\">"
                + "<a xlink:href=\"javascript&#x3a;alert(1)\"><rect width=\"5\" height=\"5\"/></a></svg>";
        String out = sanitize(svg);
        assertFalse(out.toLowerCase().contains("javascript"));
        assertFalse(out.contains("&#x3a;"));
    }

    @Test
    void stripsDataUriFromImageElement() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\">"
                + "<image href=\"data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+\"/>"
                + "<use href=\"#def\"/></svg>";
        String out = sanitize(svg);
        assertFalse(out.toLowerCase().contains("data:"));
        assertFalse(out.contains("onload"));
        assertTrue(out.contains("<use"));
    }

    @Test
    void stripsForeignObjectAndUseExternalRef() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\">"
                + "<foreignObject><div onload=\"alert(1)\">x</div></foreignObject>"
                + "<use href=\"https://evil.example/x.svg\"/></svg>";
        String out = sanitize(svg);
        assertFalse(out.contains("foreignObject"));
        assertFalse(out.contains("evil.example"));
    }

    @Test
    void allowsHttpMailtoAndFragmentUris() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" "
                + "xmlns:xlink=\"http://www.w3.org/1999/xlink\">"
                + "<a href=\"https://example.com\"><rect width=\"5\" height=\"5\"/></a>"
                + "<use href=\"#grad\"/></svg>";
        String out = sanitize(svg);
        assertTrue(out.contains("https://example.com"));
        assertTrue(out.contains("#grad"));
    }

    @Test
    void rejectsIllFormedDocuments() {
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\"><rect></svg>";
        assertThrows(IllegalArgumentException.class, () -> sanitize(svg));
    }

    @Test
    void rejectsNonSvgRoot() {
        String svg = "<html><body>hi</body></html>";
        assertThrows(IllegalArgumentException.class, () -> sanitize(svg));
    }
}
