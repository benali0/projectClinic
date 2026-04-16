package com.itbs.clinique.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.itbs.clinique.dto.SpecialiteResponse;
import com.itbs.clinique.services.SpecialiteService;

@RestController
@RequestMapping("/api/specialites")
@CrossOrigin(origins = "*")
public class SpecialiteController {

    private final SpecialiteService specialiteService;

    public SpecialiteController(SpecialiteService specialiteService) {
        this.specialiteService = specialiteService;
    }

    // Public: utile pour annuaire + prise RDV
    @GetMapping
    public List<SpecialiteResponse> getAll() {
        return specialiteService.getAll();
    }
}