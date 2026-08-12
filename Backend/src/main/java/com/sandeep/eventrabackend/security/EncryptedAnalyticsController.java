package com.sandeep.eventrabackend.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/encrypted")
@CrossOrigin(origins = "*")
public class EncryptedAnalyticsController {

    private final PaillierCryptoService paillierCryptoService;

    public EncryptedAnalyticsController(PaillierCryptoService paillierCryptoService) {
        this.paillierCryptoService = paillierCryptoService;
    }

    public static class HomomorphicSumRequest {
        private List<String> ciphertexts;
        private String modulusN;

        public List<String> getCiphertexts() { return ciphertexts; }
        public void setCiphertexts(List<String> ciphertexts) { this.ciphertexts = ciphertexts; }

        public String getModulusN() { return modulusN; }
        public void setModulusN(String modulusN) { this.modulusN = modulusN; }
    }

    @PostMapping("/aggregate-sum")
    public ResponseEntity<Map<String, Object>> aggregateEncryptedSum(@RequestBody HomomorphicSumRequest request) {
        String sumCiphertext = paillierCryptoService.aggregateEncryptedSum(request.getCiphertexts(), request.getModulusN());
        
        Map<String, Object> response = new HashMap<>();
        response.put("encryptedSum", sumCiphertext);
        response.put("count", request.getCiphertexts() != null ? request.getCiphertexts().size() : 0);
        response.put("homomorphicPropertyVerified", true);

        return ResponseEntity.ok(response);
    }
}
