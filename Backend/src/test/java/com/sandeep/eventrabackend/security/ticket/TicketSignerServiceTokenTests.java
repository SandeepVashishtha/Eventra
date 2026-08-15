package com.sandeep.eventrabackend.security.ticket;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TicketSignerServiceTokenTests {

    private TicketSignerService newService() {
        return new TicketSignerService(null, "unit-test-signing-secret");
    }

    @Test
    void generatesVerifiableSignedToken() {
        TicketSignerService service = newService();
        String token = service.generateSignedTicketToken("t1", "c1", "a@example.com");

        TicketSignerService.SignedTicketTokenResult result = service.verifySignedTicketToken(token);
        assertTrue(result.isValid());
        assertEquals("t1", result.getTicketId());
        assertEquals("c1", result.getCredentialId());
        assertEquals("a@example.com", result.getUserEmail());
    }

    @Test
    void rejectsTamperedToken() {
        TicketSignerService service = newService();
        String token = service.generateSignedTicketToken("t1", "c1", "a@example.com");
        String last = token.substring(token.length() - 1);
        String replacement = last.equals("A") ? "B" : "A";
        String tampered = token.substring(0, token.length() - 1) + replacement;

        TicketSignerService.SignedTicketTokenResult result = service.verifySignedTicketToken(tampered);
        assertFalse(result.isValid());
    }

    @Test
    void rejectsTokenSignedWithDifferentSecret() {
        TicketSignerService service = newService();
        String token = service.generateSignedTicketToken("t1", "c1", "a@example.com");

        TicketSignerService other = new TicketSignerService(null, "different-secret");
        TicketSignerService.SignedTicketTokenResult result = other.verifySignedTicketToken(token);
        assertFalse(result.isValid());
    }

    @Test
    void rejectsMalformedAndEmptyTokens() {
        TicketSignerService service = newService();
        assertFalse(service.verifySignedTicketToken("not.a.jwt").isValid());
        assertFalse(service.verifySignedTicketToken("").isValid());
        assertFalse(service.verifySignedTicketToken(null).isValid());
    }
}
