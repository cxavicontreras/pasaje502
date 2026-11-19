package gt.marketplace.catalog;

/** Recurso inexistente. Se traduce a HTTP 404. */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
