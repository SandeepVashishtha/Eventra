package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;

@Component
public class iCalHelper {

    public String escapeIcsText(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace(";", "\\;")
                    .replace(",", "\\,")
                    .replace("\n", "\\n");
    }
}
