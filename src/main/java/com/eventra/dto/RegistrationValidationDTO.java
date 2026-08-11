package com.eventra.dto;

import java.util.Map;

public class RegistrationValidationDTO {

    private String email;
    private String phoneNumber;
    private Map<String, Object> customFieldValues;
    private String teamName;
    private long fileSize;
    private String fileType;

    public RegistrationValidationDTO() {}

    public RegistrationValidationDTO(String email, String phoneNumber, Map<String, Object> customFieldValues, String teamName, long fileSize, String fileType) {
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.customFieldValues = customFieldValues;
        this.teamName = teamName;
        this.fileSize = fileSize;
        this.fileType = fileType;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Map<String, Object> getCustomFieldValues() { return customFieldValues; }
    public void setCustomFieldValues(Map<String, Object> customFieldValues) { this.customFieldValues = customFieldValues; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
}
