package com.itbs.clinique.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "specialite",
    uniqueConstraints = @UniqueConstraint(name = "uk_specialite_nom", columnNames = "nom")
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;
}