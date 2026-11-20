package com.sandeep.eventrabackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class EventraBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventraBackendApplication.class, args);
    }
}
