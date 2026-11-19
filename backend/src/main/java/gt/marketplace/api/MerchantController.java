package gt.marketplace.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.marketplace.catalog.CatalogRepository;
import gt.marketplace.catalog.NotFoundException;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {

    private final CatalogRepository catalog;

    public MerchantController(CatalogRepository catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public List<MerchantDto> list() {
        return catalog.findAllMerchants().stream().map(MerchantDto::from).toList();
    }

    @GetMapping("/{slug}")
    public MerchantDto get(@PathVariable String slug) {
        return catalog.findMerchantBySlug(slug)
                .map(MerchantDto::from)
                .orElseThrow(() -> new NotFoundException("No existe un comercio con slug '" + slug + "'."));
    }
}
