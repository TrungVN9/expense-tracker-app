package com.tv.expense_tracker.services;

import com.tv.expense_tracker.controllers.dtos.InterestProjectionEntry;
import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.controllers.dtos.SavingResponse;
import com.tv.expense_tracker.controllers.dtos.SavingTransactionResponse;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.models.SavingTransaction;
import com.tv.expense_tracker.repositories.SavingRepository;
import com.tv.expense_tracker.repositories.SavingTransactionRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class SavingService {
    private final SavingRepository savingRepository;
    private final SavingTransactionRepository transactionRepository;

    public enum SavingTransactionType {
        DEPOSIT("deposit"),
        WITHDRAWAL("withdrawal"),
        TRANSFER_IN("transfer_in"),
        TRANSFER_OUT("transfer_out");

        private final String type;

        SavingTransactionType(String type) {
            this.type = type;
        }

        public String getType() {
            return type;
        }
    }

    private Saving getSavingForCustomer(Long savingId, Customer customer) {
        Saving saving = savingRepository.findById(savingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saving not found"));
        if (!saving.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access to this saving is denied");
        }
        return saving;
    }

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
    public SavingResponse updateForCustomer(Long savingId, Customer customer, SavingRequest req) {
        Saving existing = getSavingForCustomer(savingId, customer);
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
    public SavingResponse depositToSaving(Long savingId, Customer customer, BigDecimal amount, String description) {
        Saving saving = getSavingForCustomer(savingId, customer);
        saving.setBalance(saving.getBalance().add(amount));
        Saving saved = savingRepository.save(saving);
        createSavingTransaction(saved, SavingTransactionType.DEPOSIT.getType(), amount, description);
        return mapToSavingResponse(saved);
    }

    @Transactional
    public SavingResponse withdrawFromSaving(Long savingId, Customer customer, BigDecimal amount, String description) {
        Saving saving = getSavingForCustomer(savingId, customer);
        if (saving.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        saving.setBalance(saving.getBalance().subtract(amount));
        Saving saved = savingRepository.save(saving);
        createSavingTransaction(saved, SavingTransactionType.WITHDRAWAL.getType(), amount, description);
        return mapToSavingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<SavingTransactionResponse> getTransactionsForSaving(Long savingId, Customer customer) {
        Saving saving = getSavingForCustomer(savingId, customer);
        List<SavingTransaction> transactions = transactionRepository.findBySavingOrderByCreatedAtDesc(saving);
        return transactions.stream().map(this::mapToSavingTransactionResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<InterestProjectionEntry> getInterestProjection(Long savingId, Customer customer, int months) {
        Saving saving = getSavingForCustomer(savingId, customer);
        BigDecimal monthlyRate = BigDecimal.ZERO;
        if (saving.getInterestRate() != null) {
            monthlyRate = saving.getInterestRate()
                    .divide(BigDecimal.valueOf(100), 8, RoundingMode.HALF_UP)
                    .divide(BigDecimal.valueOf(12), 8, RoundingMode.HALF_UP);
        }
        BigDecimal balance = saving.getBalance() == null ? BigDecimal.ZERO : saving.getBalance();
        List<InterestProjectionEntry> projections = new ArrayList<>();
        LocalDate current = LocalDate.now();
        for (int i = 0; i < months; i++) {
            LocalDate monthDate = current.plusMonths(i + 1);
            BigDecimal interest = balance.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
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
    public void transferBetweenSavings(Long fromId, Long toId, Customer customer, BigDecimal amount, String description) {
        Saving from = getSavingForCustomer(fromId, customer);
        Saving to = getSavingForCustomer(toId, customer);
        if (from.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds for transfer");
        }
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        savingRepository.save(from);
        savingRepository.save(to);
        createSavingTransaction(from, SavingTransactionType.TRANSFER_OUT.getType(), amount, description);
        createSavingTransaction(to, SavingTransactionType.TRANSFER_IN.getType(), amount, description);
    }

    @Transactional
    public void deleteSaving(Long savingId, Customer customer) {
        Saving saving = getSavingForCustomer(savingId, customer);
        transactionRepository.deleteBySaving(saving);
        savingRepository.delete(saving);
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
            log.debug("Failed to read description LOB for Saving id {}: {}", s.getId(), ex.getMessage());
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