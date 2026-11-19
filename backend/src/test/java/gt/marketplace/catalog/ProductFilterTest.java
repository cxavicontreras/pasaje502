package gt.marketplace.catalog;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class ProductFilterTest {

    @Test
    void blankValuesMeanNoFilter() {
        ProductFilter f = ProductFilter.of("  ", "", null, " ", null);
        assertNull(f.q());
        assertNull(f.category());
        assertNull(f.merchant());
        assertNull(f.minPrice());
        assertNull(f.maxPrice());
    }

    @Test
    void trimsTextAndParsesPrices() {
        ProductFilter f = ProductFilter.of(" termo ", "cocina", "importaciones-xela", "95", "349.00");
        assertEquals("termo", f.q());
        assertEquals(new BigDecimal("95.00"), f.minPrice());
        assertEquals(new BigDecimal("349.00"), f.maxPrice());
    }

    @Test
    void equalMinAndMaxIsAllowed() {
        ProductFilter f = ProductFilter.of(null, null, null, "95", "95");
        assertEquals(0, f.minPrice().compareTo(f.maxPrice()));
    }

    @Test
    void extraDecimalsKeepInclusiveRange() {
        ProductFilter f = ProductFilter.of(null, null, null, "10.001", "20.999");
        assertEquals(new BigDecimal("10.01"), f.minPrice());
        assertEquals(new BigDecimal("20.99"), f.maxPrice());
    }

    @Test
    void rejectsNonNumericPrice() {
        var e = assertThrows(InvalidRequestException.class,
                () -> ProductFilter.of(null, null, null, "abc", null));
        assertTrue(e.getMessage().startsWith("minPrice debe ser un número"));
    }

    @Test
    void rejectsNaNAndInfinity() {
        assertThrows(InvalidRequestException.class, () -> ProductFilter.of(null, null, null, "NaN", null));
        assertThrows(InvalidRequestException.class, () -> ProductFilter.of(null, null, null, null, "Infinity"));
    }

    @Test
    void rejectsNegativePrice() {
        var e = assertThrows(InvalidRequestException.class,
                () -> ProductFilter.of(null, null, null, null, "-1"));
        assertEquals("maxPrice no puede ser negativo.", e.getMessage());
    }

    @Test
    void rejectsMinGreaterThanMax() {
        var e = assertThrows(InvalidRequestException.class,
                () -> ProductFilter.of(null, null, null, "300", "100"));
        assertTrue(e.getMessage().contains("no puede ser mayor que maxPrice"));
    }

    @Test
    void rejectsHugePrice() {
        assertThrows(InvalidRequestException.class,
                () -> ProductFilter.of(null, null, null, "1e30", null));
    }
}
