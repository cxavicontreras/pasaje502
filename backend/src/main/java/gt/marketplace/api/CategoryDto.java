package gt.marketplace.api;

import gt.marketplace.catalog.Category;

/** Forma pública de una categoría. Los IDs viajan como string. */
public record CategoryDto(String id, String slug, String name) {

    static CategoryDto from(Category c) {
        return new CategoryDto(String.valueOf(c.id()), c.slug(), c.name());
    }
}
