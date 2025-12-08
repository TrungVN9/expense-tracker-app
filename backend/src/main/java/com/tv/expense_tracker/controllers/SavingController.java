package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.controllers.dtos.*;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.SavingRepository;
import com.tv.expense_tracker.services.SavingService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/savings")
@AllArgsConstructor
public class SavingController {

    private final SavingService savingService;
    private final SavingRepository savingRepository; // Kept for delete, should be removed
    private final CustomerRepository customerRepository;

    private Customer getCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    private Saving getSavingForCustomer(Long savingId, Customer customer) {
        Saving saving = savingRepository.findById(savingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving not found"));
        if (!saving.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access to this saving is denied");
        }
        return saving;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<SavingResponse>> getSavings() {
        Customer customer = getCurrentCustomer();
        return ResponseEntity.ok(savingService.getSavingsForCustomer(customer));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<SavingResponse> createSaving(@RequestBody SavingRequest payload) {
        Customer customer = getCurrentCustomer();
        SavingResponse r = savingService.createForCustomer(customer, payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(r);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<SavingResponse> updateSaving(@PathVariable Long id, @RequestBody SavingRequest payload) {
        Customer customer = getCurrentCustomer();
        SavingResponse r = savingService.updateForCustomer(id, customer, payload);
        return ResponseEntity.ok(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSaving(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        Saving existing = getSavingForCustomer(id, customer);
        savingRepository.delete(existing); // This should be in the service
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingResponse> deposit(@PathVariable Long id, @RequestBody AmountRequest request) {
        Customer customer = getCurrentCustomer();
        SavingResponse r = savingService.depositToSaving(id, customer, request.getAmount(), request.getDescription());
        return ResponseEntity.ok(r);
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<SavingResponse> withdraw(@PathVariable Long id, @RequestBody AmountRequest request) {
        Customer customer = getCurrentCustomer();
        SavingResponse r = savingService.withdrawFromSaving(id, customer, request.getAmount(), request.getDescription());
        return ResponseEntity.ok(r);
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<SavingTransactionResponse>> getTransactions(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        List<SavingTransactionResponse> tr = savingService.getTransactionsForSaving(id, customer);
        return ResponseEntity.ok(tr);
    }

    @GetMapping("/{id}/projection")
    public ResponseEntity<List<InterestProjectionEntry>> getProjection(@PathVariable Long id, @RequestParam(defaultValue = "12") int months) {
        Customer customer = getCurrentCustomer();
        List<InterestProjectionEntry> proj = savingService.getInterestProjection(id, customer, months);
        return ResponseEntity.ok(proj);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@RequestBody TransferRequest request) {
        Customer customer = getCurrentCustomer();
        savingService.transferBetweenSavings(request.getFromId(), request.getToId(), customer, request.getAmount(), request.getDescription());
        return ResponseEntity.noContent().build();
    }
}