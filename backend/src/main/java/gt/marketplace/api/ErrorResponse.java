package gt.marketplace.api;

/** Cuerpo de error uniforme para 400 y 404. */
public record ErrorResponse(int status, String error, String message, String path) {
}
