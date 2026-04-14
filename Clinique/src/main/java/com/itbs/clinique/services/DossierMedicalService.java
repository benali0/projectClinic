// DossierMedicalService.java
package com.itbs.clinique.services;

import com.itbs.clinique.dto.DossierMedicalResponse;
import com.itbs.clinique.entities.Consultation;

public interface DossierMedicalService {
    DossierMedicalResponse consulterDossier(Long patientId, Long medecinUserId);
    void mettreAJourDossierApresConsultation(Consultation consultation);
}