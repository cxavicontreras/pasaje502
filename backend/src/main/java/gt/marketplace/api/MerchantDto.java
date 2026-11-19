package gt.marketplace.api;

import gt.marketplace.catalog.Merchant;

/** Forma pública de un comercio. Los IDs viajan como string. */
public record MerchantDto(String id, String slug, String name, String description, String location) {

    static MerchantDto from(Merchant m) {
        return new MerchantDto(String.valueOf(m.id()), m.slug(), m.name(), m.description(), m.location());
    }
}
