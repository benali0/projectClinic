package com.itbs.clinique.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cliniqueOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Clinique API")
                        .description("Documentation Swagger/OpenAPI du backend Clinique")
                        .version("v1")
                        .contact(new Contact().name("Clinique Team"))
                        .license(new License().name("Proprietary")));
    }
}
