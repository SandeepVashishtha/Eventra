package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.util.Base64;

@Service
public class PdfTicketGenerator {

    private final KeyPair keyPair;

    public PdfTicketGenerator() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048);
        this.keyPair = keyGen.generateKeyPair();
    }

    public String generateSignedQrPayload(String ticketId, String userId) throws Exception {
        String data = ticketId + ":" + userId;
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(keyPair.getPrivate());
        signature.update(data.getBytes());
        byte[] signedBytes = signature.sign();
        
        return data + "|" + Base64.getEncoder().encodeToString(signedBytes);
    }

    public KeyPair getKeyPair() {
        return keyPair;
    }
}
