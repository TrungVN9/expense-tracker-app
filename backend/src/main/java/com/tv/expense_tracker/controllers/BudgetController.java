package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Budget;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.repositories.BudgetRepository;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.TransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public BudgetController(BudgetRepository budgetRepository, CustomerRepository customerRepository,
            TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    private Customer getCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null)
            return null;
        return customerRepository.findByEmail(email).orElse(null);
    }

    // DTO for response including computed spent
    public static class BudgetResponse {
        public Long id;
        public String category;
        public BigDecimal budgetLimit;
        public String period;
        public BigDecimal spent;

        public BudgetResponse() {
        }

        public BudgetResponse(Budget b, BigDecimal spent) {
            this.id = b.getId();
            this.category = b.getCategory();
            this.budgetLimit = b.getBudgetLimit();
            this.period = b.getPeriod();
            this.spent = spent;
        }
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets() {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Budget> budgets = budgetRepository.findByCustomer(customer);

        // load transactions for this customer once and compute sums by category
        List<Transaction> txs = transactionRepository.findByCustomerOrderByDateDesc(customer);
        Map<String, BigDecimal> spentByCategory = new HashMap<>();
        for (Transaction t : txs) {
            if ("expense".equalsIgnoreCase(t.getType())) {
                String cat = t.getCategory() == null ? "" : t.getCategory();
                spentByCategory.putIfAbsent(cat, BigDecimal.ZERO);
                spentByCategory.put(cat, spentByCategory.get(cat).add(t.getAmount()));
            }
        }

        List<BudgetResponse> resp = budgets.stream().map(b -> {
            BigDecimal spent = spentByCategory.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            return new BudgetResponse(b, spent);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@RequestBody Budget payload) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        payload.setCustomer(customer);
        Budget saved = budgetRepository.save(payload);
        // spent = 0 initially
        BudgetResponse resp = new BudgetResponse(saved, BigDecimal.ZERO);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(@PathVariable Long id, @RequestBody Budget payload) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Budget> existingOpt = budgetRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Budget existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        existing.setCategory(payload.getCategory());
        existing.setBudgetLimit(payload.getBudgetLimit());
        existing.setPeriod(payload.getPeriod());

        Budget saved = budgetRepository.save(existing);

        // recompute spent for this category
        List<Transaction> txs = transactionRepository.findByCustomerOrderByDateDesc(customer);
        BigDecimal spent = txs.stream()
                .filter(t -> "expense".equalsIgnoreCase(t.getType()) && t.getCategory() != null
                        && t.getCategory().equals(saved.getCategory()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(new BudgetResponse(saved, spent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Budget> existingOpt = budgetRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Budget existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        budgetRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBudgetStatus() {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Budget> budgets = budgetRepository.findByCustomer(customer);
        List<Transaction> txs = transactionRepository.findByCustomerOrderByDateDesc(customer);

        BigDecimal totalLimit = budgets.stream().map(Budget::getBudgetLimit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = BigDecimal.ZERO;
        for (Budget b : budgets) {
            BigDecimal spent = txs.stream()
                    .filter(t -> "expense".equalsIgnoreCase(t.getType()) && t.getCategory() != null
                            && t.getCategory().equals(b.getCategory()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totalSpent = totalSpent.add(spent);
        }

        int overallPercentage = 0;
        if (totalLimit.compareTo(BigDecimal.ZERO) > 0) {
            overallPercentage = totalSpent.multiply(BigDecimal.valueOf(100)).divide(totalLimit, 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("overallPercentage", overallPercentage);
        resp.put("totalLimit", totalLimit);
        resp.put("totalSpent", totalSpent);
        return ResponseEntity.ok(resp);
    }
}
