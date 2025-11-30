package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.controllers.dtos.SavingResponse;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.services.SavingService;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.SavingRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/savings")
@AllArgsConstructor
public class SavingController {

    private final SavingRepository savingRepository;
    private final SavingService savingService;
    private final CustomerRepository customerRepository;

    private Customer getCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null)
            return null;
        return customerRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<SavingResponse>> getSavings() {
        Customer customer = getCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(savingService.getSavingsForCustomer(customer));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<SavingResponse> createSaving(@RequestBody SavingRequest payload) {
        Customer customer = getCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        SavingResponse r = savingService.createForCustomer(customer, payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(r);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<SavingResponse> updateSaving(@PathVariable Long id, @RequestBody SavingRequest payload) {
        Customer customer = getCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<Saving> existingOpt = savingRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Saving existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        SavingResponse r = savingService.updateForCustomer(existing, payload);
        return ResponseEntity.ok(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSaving(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<Saving> existingOpt = savingRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Saving existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        savingRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
