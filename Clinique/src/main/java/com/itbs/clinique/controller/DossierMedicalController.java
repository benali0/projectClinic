package com.itbs.clinique.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.itbs.clinique.dto.DossierMedicalResponse;
import com.itbs.clinique.services.DossierMedicalService;

@RestController
@RequestMapping("/api/dossiers-medicaux")
@CrossOrigin(origins = "*")
public class DossierMedicalController {
    
    private final DossierMedicalService dossierMedicalService;
    
    // 🔥 CONSTRUCTEUR REQUIS pour l'injection
    public DossierMedicalController(DossierMedicalService dossierMedicalService) {
        this.dossierMedicalService = dossierMedicalService;
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedicalResponse> consulterDossier(
            @PathVariable Long patientId,
            @RequestParam Long medecinId) {
        return ResponseEntity.ok(dossierMedicalService.consulterDossier(patientId, medecinId));
    }
}