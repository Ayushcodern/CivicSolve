# ============================================================
# CivicSolve — Spring Boot Backend Dockerfile (Multi-Stage)
# ============================================================
# Stage 1: Build with Maven 3.9 + Temurin JDK 17
# Stage 2: Run with Temurin JRE 17 for minimal runtime image
# ============================================================

# ── Stage 1: Build ─────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first for Docker layer caching
COPY pom.xml ./

# Download dependencies in a separate layer
RUN mvn dependency:go-offline -B

# Copy source code and package fat JAR (skipping tests during image build)
COPY src/ src/
RUN mvn clean package -DskipTests -B

# ── Stage 2: Runtime ──────────────────────────────────────
FROM eclipse-temurin:17-jre AS runtime

WORKDIR /app

# Create non-root user for security
RUN groupadd --system appgroup && \
    useradd --system --gid appgroup appuser

# Copy the built fat JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set ownership
RUN chown appuser:appgroup app.jar

USER appuser

# Expose Spring Boot port
EXPOSE 8080

# Health check matching Actuator
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# JVM tuning for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
