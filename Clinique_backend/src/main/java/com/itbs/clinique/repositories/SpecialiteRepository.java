package com.itbs.clinique.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.itbs.clinique.entities.Specialite;

public interface SpecialiteRepository extends JpaRepository<Specialite, Long> {
    Optional<Specialite> findByNom(String nom);
    List<Specialite> findAllByOrderByNomAsc();
}