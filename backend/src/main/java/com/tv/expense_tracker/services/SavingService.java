package com.tv.expense_tracker.services;

import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.controllers.dtos.SavingResponse;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.repositories.SavingRepository;
import com.tv.expense_tracker.models.SavingTransaction;
import java.math.BigDecimal;
import com.tv.expense_tracker.repositories.SavingTransactionRepository;
import com.tv.expense_tracker.controllers.dtos.SavingTransactionResponse;
import com.tv.expense_tracker.controllers.dtos.InterestProjectionEntry;
import java.util.ArrayList;
import lombok.AllArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class SavingService {
    private final SavingRepository savingRepository;
    private final SavingTransactionRepository transactionRepository;
    private final Logger logger = LoggerFactory.getLogger(SavingService.class);

    @Transactional(readOnly = true)
    public List<SavingResponse> getSavingsForCustomer(Customer customer) {
        List<Saving> savings = savingRepository.findByCustomer(customer);
        return savings.stream().map(this::mapToSavingResponse).toList();
    }

    @Transactional
    public SavingResponse createForCustomer(Customer customer, SavingRequest req) {
        Saving newSaving = new Saving();
        newSaving.setCustomer(customer);
        newSaving.setName(req.getAccountName());
        newSaving.setAccountType(req.getAccountType());
        newSaving.setBalance(req.getBalance());
        newSaving.setInterestRate(req.getInterestRate());
        newSaving.setGoal(req.getGoal());
        newSaving.setDescription(req.getDescription());

        Saving saved = savingRepository.save(newSaving);
        return mapToSavingResponse(saved);
    }

    @Transactional
    public SavingResponse updateForCustomer(Saving existing, SavingRequest req) {
        existing.setName(req.getAccountName());
        existing.setAccountType(req.getAccountType());
        existing.setBalance(req.getBalance());
        existing.setInterestRate(req.getInterestRate());
        existing.setGoal(req.getGoal());
        existing.setDescription(req.getDescription());

        Saving saved = savingRepository.save(existing);
        return mapToSavingResponse(saved);
    }

    @Transactional
    public SavingResponse depositToSaving(Saving saving, BigDecimal amount, String description) {
        saving.setBalance(saving.getBalance().add(amount));
        Saving saved = savingRepository.save(saving);
        createSavingTransaction(saved, "deposit", amount, description);
        return mapToSavingResponse(saved);
    }

    @Transactional
    public SavingResponse withdrawFromSaving(Saving saving, BigDecimal amount, String description) {
        if (saving.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        saving.setBalance(saving.getBalance().subtract(amount));
        Saving saved = savingRepository.save(saving);
        createSavingTransaction(saved, "withdrawal", amount, description);
        return mapToSavingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SavingTransactionResponse> getTransactionsForSaving(Saving saving) {
        List<SavingTransaction> transactions = transactionRepository.findBySavingOrderByCreatedAtDesc(saving);
        return transactions.stream().map(this::mapToSavingTransactionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InterestProjectionEntry> getInterestProjection(Saving saving, int months) {
        java.math.BigDecimal monthlyRate = java.math.BigDecimal.ZERO;
        if (saving.getInterestRate() != null) {
            monthlyRate = saving.getInterestRate()
                    .divide(java.math.BigDecimal.valueOf(100), 8, java.math.RoundingMode.HALF_UP)
                    .divide(java.math.BigDecimal.valueOf(12), 8, java.math.RoundingMode.HALF_UP);
        }
        java.math.BigDecimal balance = saving.getBalance() == null ? java.math.BigDecimal.ZERO : saving.getBalance();
        List<InterestProjectionEntry> projections = new ArrayList<>();
        java.time.LocalDate current = java.time.LocalDate.now();
        for (int i = 0; i < months; i++) {
            java.time.LocalDate monthDate = current.plusMonths(i + 1);
            java.math.BigDecimal interest = balance.multiply(monthlyRate).setScale(2, java.math.RoundingMode.HALF_UP);
            balance = balance.add(interest);
            InterestProjectionEntry entry = new InterestProjectionEntry();
            entry.setMonth(monthDate.getMonth().toString() + " " + monthDate.getYear());
            entry.setInterest(interest);
            entry.setBalance(balance);
            projections.add(entry);
        }
        return projections;
    }

    @Transactional
    public void transferBetweenSavings(Saving from, Saving to, java.math.BigDecimal amount, String description) {
        if (from.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds for transfer");
        }
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        savingRepository.save(from);
        savingRepository.save(to);
        createSavingTransaction(from, "transfer_out", amount, description);
        createSavingTransaction(to, "transfer_in", amount, description);
    }

    private void createSavingTransaction(Saving saving, String type, BigDecimal amount, String description) {
        SavingTransaction tr = new SavingTransaction();
        tr.setSaving(saving);
        tr.setType(type);
        tr.setAmount(amount);
        tr.setDescription(description);
        transactionRepository.save(tr);
    }
    
    private SavingResponse mapToSavingResponse(Saving s) {
        SavingResponse r = new SavingResponse();
        r.setId(s.getId());
        r.setName(s.getName());
        r.setAccountType(s.getAccountType());
        r.setBalance(s.getBalance());
        r.setInterestRate(s.getInterestRate());
        r.setGoal(s.getGoal());
        try {
            r.setDescription(s.getDescription());
        } catch (Exception ex) {
            logger.debug("Failed to read description LOB for Saving id {}: {}", s.getId(), ex.getMessage());
            r.setDescription(null);
        }
        r.setCreatedAt(s.getCreatedAt());
        r.setUpdatedAt(s.getUpdatedAt());
        return r;
    }

    private SavingTransactionResponse mapToSavingTransactionResponse(SavingTransaction t) {
        SavingTransactionResponse r = new SavingTransactionResponse();
        r.setId(t.getId());
        r.setType(t.getType());
        r.setAmount(t.getAmount());
        try {
            r.setDescription(t.getDescription());
        } catch (Exception ex) {
            r.setDescription(null);
        }
        r.setCreatedAt(t.getCreatedAt());
        return r;
    }
}