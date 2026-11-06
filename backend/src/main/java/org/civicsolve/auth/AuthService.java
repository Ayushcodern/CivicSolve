package org.civicsolve.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.civicsolve.auth.dto.AuthResponse;
import org.civicsolve.auth.dto.LoginRequest;
import org.civicsolve.auth.dto.RegisterRequest;
import org.civicsolve.user.Role;
import org.civicsolve.user.User;
import org.civicsolve.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CivicSolve — Authentication & User Registration Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user with BCrypt hashed password and generates initial JWT token.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new IllegalArgumentException("Email is already registered: " + cleanEmail);
        }

        Role role = request.getRole() != null ? request.getRole() : Role.CITIZEN;

        User user = User.builder()
                .name(request.getName().trim())
                .email(cleanEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .institutionId(request.getInstitutionId())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .build();

        User saved = userRepository.save(user);
        log.info("Registered new user: id={}, email={}, role={}", saved.getUserId(), saved.getEmail(), saved.getRole());

        String token = jwtTokenProvider.generateToken(saved.getEmail(), saved.getRole(), saved.getUserId());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(saved.getUserId())
                .name(saved.getName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .institutionId(saved.getInstitutionId())
                .build();
    }

    /**
     * Authenticates user credentials and returns JWT token with profile attributes.
     */
    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(cleanEmail, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            log.warn("Failed login attempt for email: {}", cleanEmail);
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(cleanEmail)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getUserId());
        log.info("User logged in successfully: id={}, email={}", user.getUserId(), user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .institutionId(user.getInstitutionId())
                .build();
    }
}
