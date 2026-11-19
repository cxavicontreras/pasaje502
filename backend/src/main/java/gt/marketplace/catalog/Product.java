package gt.marketplace.catalog;

import java.math.BigDecimal;

public record Product(
        long id,
        String slug,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        long merchantId,
        long categoryId,
        boolean featured) {
}
