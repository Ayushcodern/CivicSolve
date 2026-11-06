package org.civicsolve;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * CivicSolve — Main Application Entry Point
 *
 * Spring Boot 3 modular monolith serving REST APIs for citizen reporting,
 * PostGIS spatial queries, institution matching, and project tracking.
 */
@SpringBootApplication
@EnableAsync
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
