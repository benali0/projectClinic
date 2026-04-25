package com.itbs.clinique;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class SwaggerIntegrationTest {

    @LocalServerPort
    private int port;

    private HttpResponse<String> get(String path) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void swaggerApiDocs_shouldBeAvailable() throws Exception {
        HttpResponse<String> response = get("/clinique/v3/api-docs");
        String body = response.body();

        assertEquals(200, response.statusCode());
        assertTrue(body.contains("\"openapi\""));
        assertTrue(body.contains("\"/api/auth/login\""));
        assertTrue(body.contains("\"title\":\"Clinique API\""));
    }

    @Test
    void swaggerUi_shouldBeAvailable() throws Exception {
        HttpResponse<String> response = get("/clinique/swagger-ui/index.html");
        assertEquals(200, response.statusCode());
    }
}
