package com.itbs.clinique.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedecinResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String tel;
    private String specialite;       // ancien champ (backward compatible)
    private Long specialiteId;       // nouveau : id de la table specialite
    private String specialiteNom;    // nouveau : nom depuis la table specialite
}