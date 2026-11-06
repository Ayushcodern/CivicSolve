package org.civicsolve.auth;

import org.civicsolve.user.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String secret = "civicsolve_super_secret_jwt_key_2026_at_least_256_bits_long";
    private final long expirationMs = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", secret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", expirationMs);
        tokenProvider.init();
    }

    @Test
    void testGenerateAndValidateToken() {
        String email = "citizen@civicsolve.in";
        Role role = Role.CITIZEN;
        Long userId = 1L;

        String token = tokenProvider.generateToken(email, role, userId);

        assertNotNull(token);
        assertTrue(tokenProvider.validateToken(token));
        assertEquals(email, tokenProvider.getEmailFromToken(token));
        assertEquals("CITIZEN", tokenProvider.getRoleFromToken(token));
        assertEquals(userId, tokenProvider.getUserIdFromToken(token));
    }

    @Test
    void testInvalidTokenReturnsFalse() {
        assertFalse(tokenProvider.validateToken("invalid.jwt.token"));
        assertFalse(tokenProvider.validateToken(""));
    }
}
