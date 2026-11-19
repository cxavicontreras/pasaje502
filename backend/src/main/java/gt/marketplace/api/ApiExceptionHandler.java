package gt.marketplace.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import gt.marketplace.catalog.InvalidRequestException;
import gt.marketplace.catalog.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> badRequest(InvalidRequestException e, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage(), request);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(NotFoundException e, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, e.getMessage(), request);
    }

    private static ResponseEntity<ErrorResponse> error(HttpStatus status, String message,
                                                       HttpServletRequest request) {
        return ResponseEntity.status(status).body(
                new ErrorResponse(status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }
}
