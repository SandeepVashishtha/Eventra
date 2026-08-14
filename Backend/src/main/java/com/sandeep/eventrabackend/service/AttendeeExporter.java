package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.List;

@Service
public class AttendeeExporter {

    public void streamToCsv(Writer writer, List<String[]> attendees) throws Exception {
        PrintWriter printWriter = new PrintWriter(writer);
        
        // Write CSV Header
        printWriter.println("Name,Email,RegistrationDate");

        for (String[] attendee : attendees) {
            String line = String.join(",", escapeSpecialCharacters(attendee));
            printWriter.println(line);
        }
        printWriter.flush();
    }

    private String[] escapeSpecialCharacters(String[] data) {
        String[] escaped = new String[data.length];
        for (int i = 0; i < data.length; i++) {
            String val = data[i];
            if (val == null) {
                escaped[i] = "";
            } else {
                escaped[i] = val.replace("\"", "\"\"");
            }
        }
        return escaped;
    }
}
