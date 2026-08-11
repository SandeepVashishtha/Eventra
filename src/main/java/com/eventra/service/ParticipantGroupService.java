package com.eventra.service;

import com.eventra.model.EventParticipant;
import com.eventra.model.ParticipantGroup;
import com.eventra.repository.EventParticipantRepository;
import com.eventra.repository.ParticipantGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;

@Service
public class ParticipantGroupService {

    private static final Logger logger = Logger.getLogger(ParticipantGroupService.class.getName());

    @Autowired
    private ParticipantGroupRepository groupRepository;

    @Autowired
    private EventParticipantRepository participantRepository;

    @Transactional
    public ParticipantGroup createGroup(Long eventId, String groupName, String description) {
        ParticipantGroup group = new ParticipantGroup(eventId, groupName, description);
        ParticipantGroup saved = groupRepository.save(group);
        logger.info("Created participant group: " + groupName + " for event ID: " + eventId);
        return saved;
    }

    @Transactional
    public ParticipantGroup renameGroup(Long groupId, String newGroupName, String newDescription) {
        ParticipantGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with ID: " + groupId));

        group.setGroupName(newGroupName);
        if (newDescription != null) {
            group.setDescription(newDescription);
        }
        return groupRepository.save(group);
    }

    @Transactional
    public EventParticipant assignParticipantToGroup(Long participantId, Long groupId) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found with ID: " + participantId));

        participant.setGroupId(groupId);
        return participantRepository.save(participant);
    }

    @Transactional
    public void removeParticipantFromGroup(Long participantId) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found with ID: " + participantId));

        participant.setGroupId(null);
        participantRepository.save(participant);
    }

    @Transactional(readOnly = true)
    public List<ParticipantGroup> getEventGroups(Long eventId) {
        return groupRepository.findByEventId(eventId);
    }

    @Transactional(readOnly = true)
    public List<EventParticipant> getParticipantsFilteredByGroup(Long eventId, Long groupId) {
        if (groupId == null) {
            return participantRepository.findByEventId(eventId);
        }
        return participantRepository.findByEventIdAndGroupId(eventId, groupId);
    }
}
