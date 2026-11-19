package gt.marketplace.api;

import java.math.BigDecimal;

import gt.marketplace.catalog.Product;

/**
 * Forma pública de un producto. IDs como string, precio como número JSON en
 * quetzales (p. ej. 249.00) y featured como booleano.
 */
public record ProductDto(
        String id,
        String slug,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        String merchantId,
        String categoryId,
        boolean featured) {

    static ProductDto from(Product p) {
        return new ProductDto(
                String.valueOf(p.id()),
                p.slug(),
                p.name(),
                p.description(),
                p.price(),
                p.imageUrl(),
                String.valueOf(p.merchantId()),
                String.valueOf(p.categoryId()),
                p.featured());
    }
}
