package com.sandeep.eventrabackend.security.passkey;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

/**
 * Controller mapping FIDO2 biometrics authentication routes (#17672).
 */
@RestController
@RequestMapping("/api/webauthn")
public class WebAuthnController {

    private final PasskeyCredentialRepository credentialRepository;

    public WebAuthnController(PasskeyCredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerPasskey(@RequestParam String username, @RequestParam String pubKey) {
        credentialRepository.saveCredential(username, pubKey);
        return ResponseEntity.ok("Passkey registered on server!");
    }
}
