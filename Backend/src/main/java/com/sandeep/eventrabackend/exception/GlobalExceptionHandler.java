package com.sandeep.eventrabackend.exception;

import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLockingFailure(
            ObjectOptimisticLockingFailureException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, "Conflict", 
                "The event was updated by another user. Please try again.", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));

        return buildError(HttpStatus.BAD_REQUEST, "Validation Error", message, request);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.UNAUTHORIZED, "Unauthorized", "Invalid username/email or password", request);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(
            UsernameNotFoundException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(
            UserAlreadyExistsException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(PasswordMismatchException.class)
    public ResponseEntity<ErrorResponse> handlePasswordMismatch(
            PasswordMismatchException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    @ExceptionHandler(RegistrationClosedException.class)
    public ResponseEntity<ErrorResponse> handleRegistrationClosed(
            RegistrationClosedException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, "Registration Closed", ex.getMessage(), request);
    }

    @ExceptionHandler(EventFullException.class)
    public ResponseEntity<ErrorResponse> handleEventFull(
            EventFullException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, "Event Full", ex.getMessage(), request);
    }

    @ExceptionHandler(RegistrationConflictException.class)
    public ResponseEntity<ErrorResponse> handleRegistrationConflict(
            RegistrationConflictException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(FeedbackAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleFeedbackAlreadyExists(
            FeedbackAlreadyExistsException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.CONFLICT, "Conflict", ex.getMessage(), request);
    }

    @ExceptionHandler(UserNotRegisteredException.class)
    public ResponseEntity<ErrorResponse> handleUserNotRegistered(
            UserNotRegisteredException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {
        return buildError(HttpStatus.FORBIDDEN, "Forbidden", "You do not have permission to access this resource", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        logger.error("Unhandled exception", ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "An unexpected error occurred", request);
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEventNotFound(
            EventNotFoundException ex,
            HttpServletRequest request) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "Not Found",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleProjectNotFound(
            ProjectNotFoundException ex,
            HttpServletRequest request) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "Not Found",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(HackathonNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleHackathonNotFound(
            HackathonNotFoundException ex,
            HttpServletRequest request) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "Not Found",
                ex.getMessage(),
                request
        );
    }

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotificationNotFound(
            NotificationNotFoundException ex,
            HttpServletRequest request) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "Not Found",
                ex.getMessage(),
                request
        );
    }

    private ResponseEntity<ErrorResponse> buildError(HttpStatus status, String error,
            String message, HttpServletRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(status).body(response);
    }
}
