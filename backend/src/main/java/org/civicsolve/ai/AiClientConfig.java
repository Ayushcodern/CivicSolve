package org.civicsolve.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Configuration for Spring Boot 3 RestClient communicating with the FastAPI AI microservice.
 */
@Configuration
public class AiClientConfig {

    @Value("${application.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${application.ai-service.timeout-ms:5000}")
    private int timeoutMs;

    @Bean
    public RestClient aiRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(timeoutMs));
        factory.setReadTimeout(Duration.ofMillis(timeoutMs));

        return RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(factory)
                .build();
    }
}
