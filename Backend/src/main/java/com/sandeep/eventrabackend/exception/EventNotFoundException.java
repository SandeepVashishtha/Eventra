package com.sandeep.eventrabackend.exception;

public class EventNotFoundException extends RuntimeException {
        public EventNotFoundException(String message){
            super(message);
        }
}
