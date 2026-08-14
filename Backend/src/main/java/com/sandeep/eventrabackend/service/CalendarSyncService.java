package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CalendarSyncService {

    public String generateEventIcsFeed(String eventId, String title, LocalDateTime start, LocalDateTime end) {
        StringWriter writer = new StringWriter();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

        writer.write("BEGIN:VCALENDAR\n");
        writer.write("VERSION:2.0\n");
        writer.write("PRODID:-//Eventra//Event Calendar Sync//EN\n");
        writer.write("BEGIN:VEVENT\n");
        writer.write("UID:" + eventId + "@eventra.com\n");
        writer.write("DTSTAMP:" + LocalDateTime.now().format(formatter) + "Z\n");
        writer.write("DTSTART:" + start.format(formatter) + "\n");
        writer.write("DTEND:" + end.format(formatter) + "\n");
        writer.write("SUMMARY:" + title + "\n");
        writer.write("END:VEVENT\n");
        writer.write("END:VCALENDAR\n");

        return writer.toString();
    }
}
