package com.sandeep.eventrabackend.controller;

import com.eventra.service.SvgSanitizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Security tests for AttachmentUploadController (#18729).
 * 
 * Verifies that:
 * - The endpoint requires authentication
 * - Empty files are rejected
 * - File extensions are validated
 * - Content types are validated
 * - File size limits are enforced
 * - SVG files are sanitized
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AttachmentUploadControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AsyncUploadManager uploadManager;

    @MockBean
    private SvgSanitizationService svgSanitizationService;

    @BeforeEach
    void setUp() throws Exception {
    }

    // ==================== Authentication Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload without authentication returns 401 (#18729)")
    void testUploadWithoutAuthentication() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Empty File Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload with empty file returns 400 (#18729)")
    @WithMockUser
    void testUploadEmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                new byte[0]
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File is empty."));
    }

    // ==================== File Extension Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload with disallowed extension returns 400 (#18729)")
    @WithMockUser
    void testUploadDisallowedExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.exe",
                MediaType.APPLICATION_OCTET_STREAM_VALUE,
                "test content".getBytes()
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File type not allowed. Allowed extensions: [.jpg, .jpeg, .png, .gif, .webp, .svg, .pdf]"));
    }

    @Test
    @DisplayName("POST /api/attachments/upload with allowed extension (jpg) succeeds (#18729)")
    @WithMockUser
    void testUploadAllowedExtension() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );

        when(uploadManager.writeToStorage(anyString(), any())).thenReturn("/uploads/test.jpg");

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isOk());
    }

    // ==================== Content Type Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload with disallowed content type returns 400 (#18729)")
    @WithMockUser
    void testUploadDisallowedContentType() throws Exception {
        // File has .jpg extension but wrong content type
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                MediaType.TEXT_PLAIN_VALUE,
                "test content".getBytes()
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File content type not allowed."));
    }

    @Test
    @DisplayName("POST /api/attachments/upload with matching extension and content type succeeds (#18729)")
    @WithMockUser
    void testUploadMatchingExtensionAndContentType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                MediaType.IMAGE_PNG_VALUE,
                "test image content".getBytes()
        );

        when(uploadManager.writeToStorage(anyString(), any())).thenReturn("/uploads/test.png");

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isOk());
    }

    // ==================== File Size Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload with file exceeding size limit returns 400 (#18729)")
    @WithMockUser
    void testUploadFileExceedingSizeLimit() throws Exception {
        // Create a file larger than the default max size (10MB)
        byte[] largeContent = new byte[10 * 1024 * 1024 + 1]; // 10MB + 1 byte
        Arrays.fill(largeContent, (byte) 'a');
        
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "large.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                largeContent
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("File size exceeds maximum limit of 10485760 bytes."));
    }

    // ==================== SVG Sanitization Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload with SVG file sanitizes content (#18729)")
    @WithMockUser
    void testUploadSvgFileSanitizesContent() throws Exception {
        String svgContent = "<svg xmlns='http://www.w3.org/2000/svg'><script>alert('xss')</script></svg>";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.svg",
                MediaType.IMAGE_SVG_XML_VALUE,
                svgContent.getBytes()
        );

        when(svgSanitizationService.sanitizeSvgContent(any())).thenReturn(
                "<svg xmlns='http://www.w3.org/2000/svg'></svg>".getBytes()
        );
        when(uploadManager.writeToStorage(anyString(), any())).thenReturn("/uploads/test.svg");

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/attachments/upload with invalid SVG content returns 400 (#18729)")
    @WithMockUser
    void testUploadInvalidSvgContent() throws Exception {
        String invalidSvgContent = "not a valid svg";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.svg",
                MediaType.IMAGE_SVG_XML_VALUE,
                invalidSvgContent.getBytes()
        );

        when(svgSanitizationService.sanitizeSvgContent(any())).thenThrow(
                new IllegalArgumentException("Not a valid SVG document")
        );

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Rejected SVG upload: Not a valid SVG document"));
    }

    // ==================== Allowed File Types Tests ====================

    @Test
    @DisplayName("POST /api/attachments/upload with PDF file succeeds (#18729)")
    @WithMockUser
    void testUploadPdfFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "%PDF-1.4 test content".getBytes()
        );

        when(uploadManager.writeToStorage(anyString(), any())).thenReturn("/uploads/test.pdf");

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/attachments/upload with GIF file succeeds (#18729)")
    @WithMockUser
    void testUploadGifFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.gif",
                MediaType.IMAGE_GIF_VALUE,
                "GIF89a test content".getBytes()
        );

        when(uploadManager.writeToStorage(anyString(), any())).thenReturn("/uploads/test.gif");

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/attachments/upload with WebP file succeeds (#18729)")
    @WithMockUser
    void testUploadWebPFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.webp",
                MediaType.IMAGE_WEBP_VALUE,
                "RIFF test WEBP".getBytes()
        );

        when(uploadManager.writeToStorage(anyString(), any())).thenReturn("/uploads/test.webp");

        mockMvc.perform(multipart("/api/attachments/upload")
                        .file(file))
                .andExpect(status().isOk());
    }
}
