package com.itbs.clinique.entities;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "rendezVous"})
@EqualsAndHashCode(exclude = {"user", "rendezVous"})
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ancien champ (garde-le temporairement si tu as déjà des données)
    private String specialite;

    // Nouveau lien (table specialite)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id")
    private Specialite specialiteRef;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "medecin")
    private List<RendezVous> rendezVous;

    public String getNom() {
        return user != null ? user.getNom() : null;
    }

    public String getPrenom() {
        return user != null ? user.getPrenom() : null;
    }

    public String getNomComplet() {
        return user != null ? user.getNomComplet() : null;
    }

    public String getEmail() {
        return user != null ? user.getUsername() : null;
    }

    public String getTel() {
        return user != null ? user.getTel() : null;
    }
}