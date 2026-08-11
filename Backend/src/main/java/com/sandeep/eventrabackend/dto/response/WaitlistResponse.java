package com.eventra.service;

import com.eventra.model.EventWaitlist;
import com.eventra.repository.EventWaitlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class EventWaitlistService {

    @Autowired
    private EventWaitlistRepository waitlistRepository;

    /**
     * Promotes the next waitlist user upon ticket cancellation.
     * Protected by @Transactional and pessimistic write locking to prevent race conditions.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void promoteNextWaitlistUser(Long eventId) {
        // Fetch the next pending waitlist entry with PESSIMISTIC_WRITE lock
        Optional<EventWaitlist> nextUserOpt = waitlistRepository.findNextPendingWithPessimisticWriteLock(eventId);

        if (nextUserOpt.isPresent()) {
            EventWaitlist waitlistEntry = nextUserOpt.get();
            waitlistEntry.setStatus("PROMOTED");
            waitlistRepository.save(waitlistEntry);
            
            // Trigger confirmation notification / ticket allocation logic here
        }
    }
}
