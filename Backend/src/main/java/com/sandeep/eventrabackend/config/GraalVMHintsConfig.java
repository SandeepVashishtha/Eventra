package com.sandeep.eventrabackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.aot.hint.*;
import org.springframework.context.annotation.ImportRuntimeHints;

/**
 * GraalVM Native AOT compilation hints config class (#16472).
 */
@Configuration
@ImportRuntimeHints(GraalVMHintsConfig.HintsRegister.class)
public class GraalVMHintsConfig {

    static class HintsRegister implements RuntimeHintsRegistrar {
        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
            // Register Jackson serializer classes for reflection optimization
            hints.reflection().registerType(
                TypeReference.of("com.sandeep.eventrabackend.service.CouponService"),
                MemberCategory.INVOKE_PUBLIC_METHODS,
                MemberCategory.DECLARED_FIELDS
            );
        }
    }
}
