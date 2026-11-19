package gt.marketplace.catalog;

/** Parámetros de consulta inválidos. Se traduce a HTTP 400. */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
