package com.eventra.service;

import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import java.util.logging.Logger;

@Service
public class SvgSanitizationService {

    private static final Logger logger = Logger.getLogger(SvgSanitizationService.class.getName());

    // Forbidden SVG elements and attributes capable of script execution / XSS vectoring
    private static final Pattern SCRIPT_TAG_PATTERN = Pattern.compile("<script[^>]*?>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile("on\\w+\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern JAVASCRIPT_URI_PATTERN = Pattern.compile("href\\s*=\\s*["']?\\s*javascript:", Pattern.CASE_INSENSITIVE);
    private static final Pattern FOREIGN_OBJECT_PATTERN = Pattern.compile("<foreignObject[^>]*?>.*?</foreignObject>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    public byte[] sanitizeSvgContent(byte[] rawSvgBytes) throws IllegalArgumentException {
        String svgContent = new String(rawSvgBytes, StandardCharsets.UTF_8);

        // Validate presence of malicious script patterns or execution hooks
        if (SCRIPT_TAG_PATTERN.matcher(svgContent).find() ||
            EVENT_HANDLER_PATTERN.matcher(svgContent).find() ||
            JAVASCRIPT_URI_PATTERN.matcher(svgContent).find() ||
            FOREIGN_OBJECT_PATTERN.matcher(svgContent).find()) {
            
            logger.warning("Potential stored XSS payload detected in uploaded SVG image file.");
            
            // Clean XML/SVG content by stripping executable elements
            String sanitizedContent = SCRIPT_TAG_PATTERN.matcher(svgContent).replaceAll("");
            sanitizedContent = EVENT_HANDLER_PATTERN.matcher(sanitizedContent).replaceAll("data-stripped-event=");
            sanitizedContent = JAVASCRIPT_URI_PATTERN.matcher(sanitizedContent).replaceAll("href="#"");
            sanitizedContent = FOREIGN_OBJECT_PATTERN.matcher(sanitizedContent).replaceAll("");
            
            return sanitizedContent.getBytes(StandardCharsets.UTF_8);
        }

        return rawSvgBytes;
    }
}
