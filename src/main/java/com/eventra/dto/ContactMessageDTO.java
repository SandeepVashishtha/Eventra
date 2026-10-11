package com.eventra.dto;

public class ContactMessageDTO {

    private String name;
    private String email;
    private String subject;
    private String message;
    
    // Hidden honeypot field intended to catch automated bots
    private String honeypot;

    public ContactMessageDTO() {}

    public ContactMessageDTO(String name, String email, String subject, String message, String honeypot) {
        this.name = name;
        this.email = email;
        this.subject = subject;
        this.message = message;
        this.honeypot = honeypot;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getHoneypot() { return honeypot; }
    public void setHoneypot(String honeypot) { this.honeypot = honeypot; }
}
