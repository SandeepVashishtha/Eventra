package com.eventra.dto;

import java.util.List;

public class RegistrationFormPreviewDTO {

    public static class FormFieldDTO {
        private String fieldName;
        private String label;
        private String fieldType; // TEXT, DROPDOWN, NUMBER, CHECKBOX
        private boolean required;
        private List<String> options;
        private int displayOrder;

        public FormFieldDTO() {}

        public FormFieldDTO(String fieldName, String label, String fieldType, boolean required, List<String> options, int displayOrder) {
            this.fieldName = fieldName;
            this.label = label;
            this.fieldType = fieldType;
            this.required = required;
            this.options = options;
            this.displayOrder = displayOrder;
        }

        public String getFieldName() { return fieldName; }
        public void setFieldName(String fieldName) { this.fieldName = fieldName; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
        public String getFieldType() { return fieldType; }
        public void setFieldType(String fieldType) { this.fieldType = fieldType; }
        public boolean isRequired() { return required; }
        public void setRequired(boolean required) { this.required = required; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public int getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    }

    private Long eventId;
    private String eventTitle;
    private List<FormFieldDTO> fields;

    public RegistrationFormPreviewDTO() {}

    public RegistrationFormPreviewDTO(Long eventId, String eventTitle, List<FormFieldDTO> fields) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.fields = fields;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }
    public List<FormFieldDTO> getFields() { return fields; }
    public void setFields(List<FormFieldDTO> fields) { this.fields = fields; }
}
