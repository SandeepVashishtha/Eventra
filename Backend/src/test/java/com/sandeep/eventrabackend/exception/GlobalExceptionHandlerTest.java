package com.sandeep.eventrabackend.exception;

import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import jakarta.persistence.OptimisticLockException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleOptimisticLockingFailure_ObjectOptimisticLockingFailureException() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/events/1");

        ObjectOptimisticLockingFailureException exception = 
                new ObjectOptimisticLockingFailureException("Event", 1L);

        ResponseEntity<ErrorResponse> response = 
                exceptionHandler.handleOptimisticLockingFailure(exception, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("/api/events/1", response.getBody().getPath());
        assertTrue(response.getBody().getMessage().contains("updated concurrently"));
    }

    @Test
    void handleOptimisticLockingFailure_OptimisticLockException() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/tickets/cancel");

        OptimisticLockException exception = new OptimisticLockException("Optimistic lock failed");

        ResponseEntity<ErrorResponse> response = 
                exceptionHandler.handleOptimisticLockingFailure(exception, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Conflict", response.getBody().getError());
        assertEquals("/api/tickets/cancel", response.getBody().getPath());
    }
}
