package gt.marketplace.catalog;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.Optional;

import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StreamUtils;

/** Acceso de solo lectura al catálogo con SQL explícito. */
@Repository
public class CatalogRepository {

    private static final String PRODUCT_COLUMNS = """
            p.id, p.slug, p.name, p.description, p.price, p.image_url,
            p.merchant_id, p.category_id, p.featured
            """;

    private static final RowMapper<Category> CATEGORY_MAPPER = (rs, i) -> new Category(
            rs.getLong("id"), rs.getString("slug"), rs.getString("name"));

    private static final RowMapper<Merchant> MERCHANT_MAPPER = (rs, i) -> new Merchant(
            rs.getLong("id"), rs.getString("slug"), rs.getString("name"),
            rs.getString("description"), rs.getString("location"));

    private static final RowMapper<Product> PRODUCT_MAPPER = CatalogRepository::mapProduct;

    private final NamedParameterJdbcTemplate jdbc;
    private final String findProductsSql;

    public CatalogRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
        this.findProductsSql = loadSql("sql/find-products.sql");
    }

    public List<Category> findAllCategories() {
        return jdbc.query("SELECT id, slug, name FROM categories ORDER BY name, id", CATEGORY_MAPPER);
    }

    public List<Merchant> findAllMerchants() {
        return jdbc.query(
                "SELECT id, slug, name, description, location FROM merchants ORDER BY name, id",
                MERCHANT_MAPPER);
    }

    public Optional<Merchant> findMerchantBySlug(String slug) {
        return jdbc.query(
                "SELECT id, slug, name, description, location FROM merchants WHERE slug = :slug",
                new MapSqlParameterSource("slug", slug), MERCHANT_MAPPER).stream().findFirst();
    }

    public List<Product> findProducts(ProductFilter filter) {
        // Tipos declarados para que el driver mande NULL con tipo conocido.
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("q", filter.q(), Types.VARCHAR)
                .addValue("category", filter.category(), Types.VARCHAR)
                .addValue("merchant", filter.merchant(), Types.VARCHAR)
                .addValue("minPrice", filter.minPrice(), Types.NUMERIC)
                .addValue("maxPrice", filter.maxPrice(), Types.NUMERIC);
        return jdbc.query(findProductsSql, params, PRODUCT_MAPPER);
    }

    public Optional<Product> findProductBySlug(String slug) {
        return jdbc.query(
                "SELECT " + PRODUCT_COLUMNS + " FROM products p WHERE p.slug = :slug",
                new MapSqlParameterSource("slug", slug), PRODUCT_MAPPER).stream().findFirst();
    }

    private static Product mapProduct(ResultSet rs, int rowNum) throws SQLException {
        return new Product(
                rs.getLong("id"),
                rs.getString("slug"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getBigDecimal("price"),
                rs.getString("image_url"),
                rs.getLong("merchant_id"),
                rs.getLong("category_id"),
                rs.getBoolean("featured"));
    }

    private static String loadSql(String path) {
        try (var in = new ClassPathResource(path).getInputStream()) {
            return StreamUtils.copyToString(in, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer " + path, e);
        }
    }
}
