package gt.marketplace.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.isA;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Pruebas de punta a punta contra el PostgreSQL local con el seed de "dev".
 * Se omiten si DB_PASSWORD no está definido (ver README).
 */
@SpringBootTest(properties = "app.cors.allowed-origins=http://localhost:5173")
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@EnabledIfEnvironmentVariable(named = "DB_PASSWORD", matches = ".+")
class CatalogApiTest {

    @Autowired
    MockMvc mvc;

    @Test
    void listsCatalog() throws Exception {
        mvc.perform(get("/api/categories")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(5)));
        mvc.perform(get("/api/merchants")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(3)));
        mvc.perform(get("/api/products")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(16)));
    }

    @Test
    void productHasPublicShape() throws Exception {
        mvc.perform(get("/api/products/audifonos-inalambricos-xela"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", isA(String.class)))
                .andExpect(jsonPath("$.merchantId", isA(String.class)))
                .andExpect(jsonPath("$.categoryId", isA(String.class)))
                .andExpect(jsonPath("$.price", is(249.00)))
                .andExpect(jsonPath("$.featured", is(true)))
                .andExpect(jsonPath("$.imageUrl", is("/images/products/audifonos-inalambricos.jpg")));
    }

    @Test
    void searchesByProductAndMerchantIgnoringCaseAndAccents() throws Exception {
        mvc.perform(get("/api/products").param("q", "AUDIFONOS"))
                .andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(get("/api/products").param("q", "almacen"))
                .andExpect(jsonPath("$", hasSize(6)));
        mvc.perform(get("/api/products").param("q", "cámara"))
                .andExpect(jsonPath("$[0].slug", is("camara-seguridad-wifi")));
    }

    @Test
    void merchantFilterDoesNotMixMerchants() throws Exception {
        mvc.perform(get("/api/products").param("q", "licuadora").param("merchant", "importaciones-xela"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug", is("licuadora-5-velocidades-xela")));
        mvc.perform(get("/api/products").param("merchant", "variedades-la-antigua"))
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[*].slug", not(hasItem("termo-acero-1l-el-quetzal"))));
    }

    @Test
    void combinedFiltersAndInclusiveRange() throws Exception {
        mvc.perform(get("/api/products").param("category", "cocina").param("minPrice", "95").param("maxPrice", "150"))
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[*].price", everyItem(isA(Number.class))));
    }

    @Test
    void emptyResultIsOkWithEmptyArray() throws Exception {
        mvc.perform(get("/api/products").param("q", "no-existe-nada"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/products").param("category", "categoria-inexistente"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void invalidPricesReturn400() throws Exception {
        mvc.perform(get("/api/products").param("minPrice", "abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("minPrice")));
        mvc.perform(get("/api/products").param("maxPrice", "-5"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/products").param("minPrice", "300").param("maxPrice", "100"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownSlugsReturn404() throws Exception {
        mvc.perform(get("/api/products/no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("no-existe")));
        mvc.perform(get("/api/merchants/no-existe")).andExpect(status().isNotFound());
    }

    @Test
    void corsAllowsConfiguredOrigin() throws Exception {
        mvc.perform(get("/api/products").header("Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
