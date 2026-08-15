package com.sandeep.eventrabackend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.sandeep.eventrabackend.exception.InvalidGoogleTokenException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    private volatile GoogleIdTokenVerifier verifier;

    public GoogleIdToken.Payload verifyToken(String token) {
        try {
            GoogleIdToken idToken = getVerifier().verify(token);

            if (idToken != null) {
                return idToken.getPayload();
            }

            throw new InvalidGoogleTokenException("Invalid Google token");
        } catch (InvalidGoogleTokenException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InvalidGoogleTokenException("Invalid Google token", ex);
        }
    }

    GoogleIdTokenVerifier getVerifier() {
        GoogleIdTokenVerifier local = verifier;
        if (local == null) {
            synchronized (this) {
                local = verifier;
                if (local == null) {
                    verifier = local = new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            new GsonFactory()
                    )
                            .setAudience(
                                    Collections.singletonList(googleClientId)
                            )
                            .build();
                }
            }
        }
        return local;
    }
}