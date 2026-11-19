package gt.marketplace.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gt.marketplace.catalog.CatalogRepository;
import gt.marketplace.catalog.NotFoundException;
import gt.marketplace.catalog.ProductFilter;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final CatalogRepository catalog;

    public ProductController(CatalogRepository catalog) {
        this.catalog = catalog;
    }

    /**
     * Los precios llegan como String para responder 400 con un mensaje propio
     * (ProductFilter.of valida y normaliza) en lugar del error genérico de Spring.
     */
    @GetMapping
    public List<ProductDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String merchant,
            @RequestParam(required = false) String minPrice,
            @RequestParam(required = false) String maxPrice) {
        ProductFilter filter = ProductFilter.of(q, category, merchant, minPrice, maxPrice);
        return catalog.findProducts(filter).stream().map(ProductDto::from).toList();
    }

    @GetMapping("/{slug}")
    public ProductDto get(@PathVariable String slug) {
        return catalog.findProductBySlug(slug)
                .map(ProductDto::from)
                .orElseThrow(() -> new NotFoundException("No existe un producto con slug '" + slug + "'."));
    }
}
