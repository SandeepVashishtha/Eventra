package com.sandeep.eventrabackend.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Thread-safe Event waitlist eviction queue scheduler (#16504).
 */
@Component
public class WaitlistEvictionScheduler {

    // Thread-safe collection prevents ConcurrentModificationException during loop modifications
    private final List<String> activeWaitlist = new CopyOnWriteArrayList<>();

    public WaitlistEvictionScheduler() {
        activeWaitlist.add("waitlist_item_1");
        activeWaitlist.add("waitlist_item_2");
    }

    @Scheduled(fixedRate = 60000)
    public void processEvictions() {
        synchronized (activeWaitlist) {
            Iterator<String> iterator = activeWaitlist.iterator();
            while (iterator.hasNext()) {
                String item = iterator.next();
                if (item.endsWith("1")) {
                    // Safe removal in iterator
                    activeWaitlist.remove(item);
                }
            }
        }
    }

    public List<String> getActiveWaitlist() {
        return activeWaitlist;
    }
}
