package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.SavingRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/savings")
@AllArgsConstructor
public class SavingController {

    private final SavingRepository savingRepository;
    private final CustomerRepository customerRepository;

    private Customer getCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null)
            return null;
        return customerRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Saving>> getSavings() {
        Customer customer = getCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<Saving> savings = savingRepository.findByCustomer(customer);
        return ResponseEntity.ok(savings);
    }

    @PostMapping
    public ResponseEntity<Saving> createSaving(@RequestBody SavingRequest payload) {
        Customer customer = getCurrentCustomer();
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Saving newSaving = new Saving();
        newSaving.setCustomer(customer);
        newSaving.setName(payload.getAccountName());
        newSaving.setAccountType(payload.getAccountType());
        newSaving.setBalance(payload.getBalance());
        newSaving.setInterestRate(payload.getInterestRate());
        newSaving.setGoal(payload.getGoal());
        newSaving.setDescription(payload.getDescription());

        Saving saved = savingRepository.save(newSaving);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Saving> updateSaving(@PathVariable Long id, @RequestBody SavingRequest payload) {
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

        existing.setName(payload.getAccountName());
        existing.setAccountType(payload.getAccountType());
        existing.setBalance(payload.getBalance());
        existing.setInterestRate(payload.getInterestRate());
        existing.setGoal(payload.getGoal());
        existing.setDescription(payload.getDescription());

        Saving saved = savingRepository.save(existing);
        return ResponseEntity.ok(saved);
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
