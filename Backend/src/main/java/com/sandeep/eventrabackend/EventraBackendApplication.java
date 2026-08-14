package com.sandeep.eventrabackend;

import com.eventra.service.QrCodeValidationService;
import com.eventra.service.SvgSanitizationService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableScheduling; // 1. Added import

@SpringBootApplication
@EnableScheduling // 2. Added annotation to turn on background cleanup
@Import({SvgSanitizationService.class, QrCodeValidationService.class})
public class EventraBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventraBackendApplication.class, args);
    }

}