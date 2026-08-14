package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;
import java.security.PublicKey;
import java.security.Signature;
import java.util.Base64;

@Component
public class SignatureVerifier {

    public boolean verifySignature(String payload, PublicKey publicKey) {
        try {
            String[] parts = payload.split("\\|");
            if (parts.length != 2) return false;

            String data = parts[0];
            byte[] signatureBytes = Base64.getDecoder().decode(parts[1]);

            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(data.getBytes());

            return signature.verify(signatureBytes);
        } catch (Exception e) {
            return false;
        }
    }
}
