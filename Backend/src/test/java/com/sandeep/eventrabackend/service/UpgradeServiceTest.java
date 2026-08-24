package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.AddonInventory;
import com.sandeep.eventrabackend.repository.AddonInventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UpgradeServiceTest {

    @Mock
    private AddonInventoryRepository addonInventoryRepository;

    @InjectMocks
    private UpgradeService upgradeService;

    @Test
    @DisplayName("Should initialize VIP_LOUNGE_PASS inventory on startup if not already existing")
    void testInitInventoryWhenNotExists() {
        when(addonInventoryRepository.existsById("VIP_LOUNGE_PASS")).thenReturn(false);

        upgradeService.initInventory();

        verify(addonInventoryRepository, times(1)).save(any(AddonInventory.class));
    }

    @Test
    @DisplayName("Should skip inventory initialization on startup if record already exists")
    void testInitInventoryWhenAlreadyExists() {
        when(addonInventoryRepository.existsById("VIP_LOUNGE_PASS")).thenReturn(true);

        upgradeService.initInventory();

        verify(addonInventoryRepository, never()).save(any(AddonInventory.class));
    }

    @Test
    @DisplayName("Should return true when add-on inventory decrement succeeds")
    void testAllocateAddonSuccess() {
        when(addonInventoryRepository.decrementRemainingIfPositive("VIP_LOUNGE_PASS")).thenReturn(1);

        boolean result = upgradeService.allocateAddon("VIP_LOUNGE_PASS");

        assertTrue(result);
        verify(addonInventoryRepository, times(1)).decrementRemainingIfPositive("VIP_LOUNGE_PASS");
    }

    @Test
    @DisplayName("Should return false when add-on inventory is depleted (decrement returns 0)")
    void testAllocateAddonDepleted() {
        when(addonInventoryRepository.decrementRemainingIfPositive("VIP_LOUNGE_PASS")).thenReturn(0);

        boolean result = upgradeService.allocateAddon("VIP_LOUNGE_PASS");

        assertFalse(result);
        verify(addonInventoryRepository, times(1)).decrementRemainingIfPositive("VIP_LOUNGE_PASS");
    }

    @Test
    @DisplayName("Should return correct remaining quota from repository")
    void testGetRemainingAddonQuota() {
        AddonInventory inventory = new AddonInventory("VIP_LOUNGE_PASS", 10);
        when(addonInventoryRepository.findById("VIP_LOUNGE_PASS")).thenReturn(Optional.of(inventory));

        int remaining = upgradeService.getRemainingAddonQuota("VIP_LOUNGE_PASS");

        assertEquals(10, remaining);
    }
}
