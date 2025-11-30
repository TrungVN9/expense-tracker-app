package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.controllers.dtos.AmountRequest;
import com.tv.expense_tracker.controllers.dtos.TransferRequest;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/savings")
@AllArgsConstructor
public class SavingController {

    private final SavingRepository savingRepository;
    private final SavingService savingService;
    private static final Logger logger = LoggerFactory.getLogger(SavingController.class);
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

    @PostMapping("/{id}/deposit")
    public ResponseEntity<SavingResponse> deposit(@PathVariable Long id, @RequestBody AmountRequest request) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Saving> existingOpt = savingRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Saving existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        logger.info("Deposit request id={}, amount={}", id, request.getAmount());
        try {
            SavingResponse r = savingService.depositToSaving(existing, request.getAmount(), request.getDescription());
            logger.info("Deposit success id={}, newBalance={}", id, r.getBalance());
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException ex) {
            logger.warn("Deposit failed id={}, reason={}", id, ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<SavingResponse> withdraw(@PathVariable Long id, @RequestBody AmountRequest request) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Saving> existingOpt = savingRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Saving existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        logger.info("Withdraw request id={}, amount={}", id, request.getAmount());
        try {
            SavingResponse r = savingService.withdrawFromSaving(existing, request.getAmount(),
                    request.getDescription());
            logger.info("Withdraw success id={}, newBalance={}", id, r.getBalance());
            return ResponseEntity.ok(r);
        } catch (IllegalArgumentException ex) {
            logger.warn("Withdraw failed id={}, reason={}", id, ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<com.tv.expense_tracker.controllers.dtos.SavingTransactionResponse>> getTransactions(
            @PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Saving> existingOpt = savingRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Saving existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        List<com.tv.expense_tracker.controllers.dtos.SavingTransactionResponse> tr = savingService
                .getTransactionsForSaving(existing);
        return ResponseEntity.ok(tr);
    }

    @GetMapping("/{id}/projection")
    public ResponseEntity<List<com.tv.expense_tracker.controllers.dtos.InterestProjectionEntry>> getProjection(
            @PathVariable Long id, @RequestParam(defaultValue = "12") int months) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Saving> existingOpt = savingRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Saving existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        List<com.tv.expense_tracker.controllers.dtos.InterestProjectionEntry> proj = savingService
                .getInterestProjection(existing, months);
        return ResponseEntity.ok(proj);
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transfer(@RequestBody TransferRequest request) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Saving> fromOpt = savingRepository.findById(request.getFromId());
        Optional<Saving> toOpt = savingRepository.findById(request.getToId());
        if (fromOpt.isEmpty() || toOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Saving from = fromOpt.get();
        Saving to = toOpt.get();
        if (!from.getCustomer().getId().equals(customer.getId())
                || !to.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            savingService.transferBetweenSavings(from, to, request.getAmount(), request.getDescription());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
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