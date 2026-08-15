package com.eventra.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.Document;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.concurrent.CompletableFuture;

@Service
public class PdfTicketGeneratorService {

    @Async
    public CompletableFuture<byte[]> generateTicketPdfAsync(String ticketId, String eventName, String attendeeName) {
        if (ticketId == null || ticketId.isBlank()) {
            throw new IllegalArgumentException("Ticket ID must not be null or blank.");
        }
        if (eventName == null || eventName.isBlank()) {
            throw new IllegalArgumentException("Event name must not be null or blank.");
        }
        if (attendeeName == null || attendeeName.isBlank()) {
            throw new IllegalArgumentException("Attendee name must not be null or blank.");
        }
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            try {
                PdfWriter.getInstance(document, baos);
                document.open();

                document.add(new Paragraph("Eventra - Official Ticket"));
                document.add(new Paragraph("Event: " + eventName));
                document.add(new Paragraph("Attendee: " + attendeeName));
                document.add(new Paragraph("Ticket ID: " + ticketId));

                QRCodeWriter qrCodeWriter = new QRCodeWriter();
                BitMatrix bitMatrix = qrCodeWriter.encode(ticketId, BarcodeFormat.QR_CODE, 200, 200);
                ByteArrayOutputStream qrBaos = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrBaos);

                Image qrImage = Image.getInstance(qrBaos.toByteArray());
                document.add(qrImage);
            } finally {
                document.close();
            }
            return CompletableFuture.completedFuture(baos.toByteArray());
        } catch (Exception e) {
            CompletableFuture<byte[]> failedFuture = new CompletableFuture<>();
            failedFuture.completeExceptionally(e);
            return failedFuture;
        }
    }
}
