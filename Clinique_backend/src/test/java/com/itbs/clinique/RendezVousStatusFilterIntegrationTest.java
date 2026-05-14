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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class RendezVousStatusFilterIntegrationTest {

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
    void getAllRendezVous_withValidStatut_shouldReturn200() throws Exception {
        HttpResponse<String> response = get("/clinique/api/rendezvous?statut=CONFIRME");
        assertEquals(200, response.statusCode());
    }

    @Test
    void getAllRendezVous_withInvalidStatut_shouldReturn400() throws Exception {
        HttpResponse<String> response = get("/clinique/api/rendezvous?statut=xxx");
        assertEquals(400, response.statusCode());
    }
}
