package com.sandeep.eventrabackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class HackathonNotFoundException extends RuntimeException {
    public HackathonNotFoundException(String message) {
        super(message);
    }
}
