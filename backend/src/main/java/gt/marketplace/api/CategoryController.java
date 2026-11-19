package gt.marketplace.api;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gt.marketplace.catalog.CatalogRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CatalogRepository catalog;

    public CategoryController(CatalogRepository catalog) {
        this.catalog = catalog;
    }

    @GetMapping
    public List<CategoryDto> list() {
        return catalog.findAllCategories().stream().map(CategoryDto::from).toList();
    }
}
