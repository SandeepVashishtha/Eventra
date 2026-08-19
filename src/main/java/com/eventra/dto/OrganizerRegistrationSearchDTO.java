package com.eventra.dto;

public class OrganizerRegistrationSearchDTO {

    public enum SearchFilterType {
        NAME,
        EMAIL,
        REGISTRATION_ID,
        TEAM_NAME
    }

    private Long eventId;
    private String searchQuery;
    private SearchFilterType filterType;

    public OrganizerRegistrationSearchDTO() {}

    public OrganizerRegistrationSearchDTO(Long eventId, String searchQuery, SearchFilterType filterType) {
        this.eventId = eventId;
        this.searchQuery = searchQuery;
        this.filterType = filterType;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getSearchQuery() { return searchQuery; }
    public void setSearchQuery(String searchQuery) { this.searchQuery = searchQuery; }

    public SearchFilterType getFilterType() { return filterType; }
    public void setFilterType(SearchFilterType filterType) { this.filterType = filterType; }
}
