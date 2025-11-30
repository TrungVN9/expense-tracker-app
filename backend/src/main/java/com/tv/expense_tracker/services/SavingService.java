package com.tv.expense_tracker.services;

import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.controllers.dtos.SavingResponse;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.repositories.SavingRepository;
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
    private final Logger logger = LoggerFactory.getLogger(SavingService.class);

    @Transactional(readOnly = true)
    public List<SavingResponse> getSavingsForCustomer(Customer customer) {
        List<Saving> savings = savingRepository.findByCustomer(customer);
        return savings.stream().map(s -> {
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
                // if the LOB isn't accessible, log at debug and continue with null
                logger.debug("Failed to read description LOB for Saving id {}: {}", s.getId(), ex.getMessage());
                r.setDescription(null);
            }
            r.setCreatedAt(s.getCreatedAt());
            r.setUpdatedAt(s.getUpdatedAt());
            return r;
        }).toList();
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
        SavingResponse r = new SavingResponse();
        r.setId(saved.getId());
        r.setName(saved.getName());
        r.setAccountType(saved.getAccountType());
        r.setBalance(saved.getBalance());
        r.setInterestRate(saved.getInterestRate());
        r.setGoal(saved.getGoal());
        try {
            r.setDescription(saved.getDescription());
        } catch (Exception ex) {
            logger.debug("Failed to read description LOB for Saved entity id {}: {}", saved.getId(), ex.getMessage());
            r.setDescription(null);
        }
        r.setCreatedAt(saved.getCreatedAt());
        r.setUpdatedAt(saved.getUpdatedAt());
        return r;
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
        SavingResponse r = new SavingResponse();
        r.setId(saved.getId());
        r.setName(saved.getName());
        r.setAccountType(saved.getAccountType());
        r.setBalance(saved.getBalance());
        r.setInterestRate(saved.getInterestRate());
        r.setGoal(saved.getGoal());
        try {
            r.setDescription(saved.getDescription());
        } catch (Exception ex) {
            logger.debug("Failed to read description LOB for Saved entity id {}: {}", saved.getId(), ex.getMessage());
            r.setDescription(null);
        }
        r.setCreatedAt(saved.getCreatedAt());
        r.setUpdatedAt(saved.getUpdatedAt());
        return r;
    }
}
