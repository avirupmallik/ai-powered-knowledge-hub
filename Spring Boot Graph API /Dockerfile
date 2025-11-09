# Use Maven to build the jar, then run with a slim JDK image
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy Maven wrapper and pom first (for layer caching)
COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw ./

# Copy source code
COPY src/ ./src/

# Build the jar (skip tests for faster build)
RUN mvn -DskipTests package

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /workspace/target/hub-0.0.1-SNAPSHOT.jar app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

