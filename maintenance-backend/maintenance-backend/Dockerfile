FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN printf '<settings><mirrors><mirror><id>google-maven-central</id><name>GCS Maven Central mirror Asia</name><url>https://maven-central-asia.storage-download.googleapis.com/maven2/</url><mirrorOf>central</mirrorOf></mirror></mirrors></settings>' > /tmp/mvn-settings.xml && mvn -B -s /tmp/mvn-settings.xml -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/target/maintenance-backend-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
