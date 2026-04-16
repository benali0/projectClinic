package com.itbs.clinique.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.itbs.clinique.dto.SpecialiteResponse;
import com.itbs.clinique.repositories.SpecialiteRepository;

@Service
public class SpecialiteServiceImpl implements SpecialiteService {

    private final SpecialiteRepository specialiteRepository;

    public SpecialiteServiceImpl(SpecialiteRepository specialiteRepository) {
        this.specialiteRepository = specialiteRepository;
    }

    @Override
    public List<SpecialiteResponse> getAll() {
        return specialiteRepository.findAllByOrderByNomAsc()
                .stream()
                .map(s -> new SpecialiteResponse(s.getId(), s.getNom()))
                .toList();
    }
}