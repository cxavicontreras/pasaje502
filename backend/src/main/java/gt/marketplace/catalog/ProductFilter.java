package gt.marketplace.catalog;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Filtros de GET /api/products ya normalizados y validados.
 * Un campo null significa "sin filtro". Java puro, sin dependencias de Spring.
 */
public record ProductFilter(
        String q,
        String category,
        String merchant,
        BigDecimal minPrice,
        BigDecimal maxPrice) {

    /** Mayor precio representable en la columna NUMERIC(12, 2). */
    static final BigDecimal MAX_PRICE = new BigDecimal("9999999999.99");

    public static ProductFilter of(String q, String category, String merchant,
                                   String minPrice, String maxPrice) {
        BigDecimal min = parsePrice("minPrice", minPrice);
        BigDecimal max = parsePrice("maxPrice", maxPrice);
        if (min != null && max != null && min.compareTo(max) > 0) {
            throw new InvalidRequestException(
                    "minPrice (" + min.toPlainString() + ") no puede ser mayor que maxPrice ("
                            + max.toPlainString() + ").");
        }
        // Los precios guardados tienen 2 decimales, así que redondear el mínimo
        // hacia arriba y el máximo hacia abajo conserva exactamente el rango
        // inclusivo y evita mandar a la base escalas absurdas (p. ej. 1e-999).
        return new ProductFilter(
                blankToNull(q),
                blankToNull(category),
                blankToNull(merchant),
                min == null ? null : min.setScale(2, RoundingMode.CEILING),
                max == null ? null : max.setScale(2, RoundingMode.FLOOR));
    }

    private static BigDecimal parsePrice(String name, String raw) {
        String value = blankToNull(raw);
        if (value == null) {
            return null;
        }
        BigDecimal price;
        try {
            price = new BigDecimal(value);
        } catch (NumberFormatException e) {
            throw new InvalidRequestException(
                    name + " debe ser un número en quetzales, por ejemplo 150 o 99.50. Valor recibido: '"
                            + value + "'.");
        }
        if (price.signum() < 0) {
            throw new InvalidRequestException(name + " no puede ser negativo.");
        }
        if (price.compareTo(MAX_PRICE) > 0) {
            throw new InvalidRequestException(
                    name + " no puede ser mayor que " + MAX_PRICE.toPlainString() + ".");
        }
        return price;
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
