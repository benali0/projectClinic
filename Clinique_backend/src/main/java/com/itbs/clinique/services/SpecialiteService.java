package com.itbs.clinique.services;

import java.util.List;

import com.itbs.clinique.dto.SpecialiteResponse;

public interface SpecialiteService {
    List<SpecialiteResponse> getAll();
}