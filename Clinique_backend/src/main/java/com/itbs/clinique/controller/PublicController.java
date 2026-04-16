package com.itbs.clinique.controller;

import com.itbs.clinique.dto.MedecinResponse;
import com.itbs.clinique.services.MedecinService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {
    
    private final MedecinService medecinService;

    public PublicController(MedecinService medecinService) {
        this.medecinService = medecinService;
    }

    // GET /api/public/medecins - Liste publique (support optionnel ?specialiteId=)
    @GetMapping("/medecins")
    public ResponseEntity<List<MedecinResponse>> getAllMedecins(
            @RequestParam(required = false) Long specialiteId) {
        if (specialiteId != null) {
            return ResponseEntity.ok(medecinService.getMedecinsBySpecialiteId(specialiteId));
        }
        return ResponseEntity.ok(medecinService.getAllMedecins());
    }

    // GET /api/public/medecins/specialite/{specialite} (ancien endpoint conservé)
    @GetMapping("/medecins/specialite/{specialite}")
    public ResponseEntity<List<MedecinResponse>> getBySpecialite(
            @PathVariable String specialite) {
        return ResponseEntity.ok(medecinService.getMedecinsBySpecialite(specialite));
    }
}