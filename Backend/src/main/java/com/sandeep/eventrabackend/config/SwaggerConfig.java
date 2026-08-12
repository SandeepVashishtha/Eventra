package com.sandeep.eventrabackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI eventraOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Eventra API")
                        .description("""
                                **Eventra** - Event Management Platform REST API.

                                ### Authentication
                                - Use `POST /api/auth/signup` to create an account.
                                - Use `POST /api/auth/login` to obtain a JWT token.
                                - Click **Authorize** and paste the token to test protected endpoints.

                                ### Events
                                - Use `GET /api/events` to retrieve all available events.

                                ### Rate limiting
                                Public auth/contact endpoints are rate limited by client IP.
                                When a limit is exceeded, the API returns `429 Too Many Requests`
                                with a standard error body and `Retry-After` header.
                                """)
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Sandeep Vashishtha")
                                .email("sandeepvashishtha@outlook.in"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste your JWT token here (without 'Bearer ' prefix)")));
    }
}
