package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Budget;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.repositories.BudgetRepository;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@AllArgsConstructor
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

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

    private Customer getCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
    }

    private Map<String, BigDecimal> calculateSpentByCategory(Customer customer) {
        List<Transaction> txs = transactionRepository.findByCustomerOrderByDateDesc(customer);
        Map<String, BigDecimal> spentByCategory = new HashMap<>();
        for (Transaction t : txs) {
            if ("expense".equalsIgnoreCase(t.getType())) {
                String cat = t.getCategory() == null ? "" : t.getCategory();
                spentByCategory.putIfAbsent(cat, BigDecimal.ZERO);
                spentByCategory.put(cat, spentByCategory.get(cat).add(t.getAmount()));
            }
        }
        return spentByCategory;
    }

    private Budget getBudgetForCustomer(Long id, Customer customer) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        if (!budget.getCustomer().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access to this budget is denied");
        }
        return budget;
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets() {
        Customer customer = getCurrentCustomer();
        List<Budget> budgets = budgetRepository.findByCustomer(customer);
        Map<String, BigDecimal> spentByCategory = calculateSpentByCategory(customer);

        List<BudgetResponse> resp = budgets.stream().map(b -> {
            BigDecimal spent = spentByCategory.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            return new BudgetResponse(b, spent);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@RequestBody Budget payload) {
        Customer customer = getCurrentCustomer();
        payload.setCustomer(customer);
        Budget saved = budgetRepository.save(payload);
        // recompute spent for this category
        Map<String, BigDecimal> spentByCategory = calculateSpentByCategory(customer);
        BigDecimal spent = spentByCategory.getOrDefault(saved.getCategory(), BigDecimal.ZERO);
        BudgetResponse resp = new BudgetResponse(saved, spent);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(@PathVariable Long id, @RequestBody Budget payload) {
        Customer customer = getCurrentCustomer();
        Budget existing = getBudgetForCustomer(id, customer);

        existing.setCategory(payload.getCategory());
        existing.setBudgetLimit(payload.getBudgetLimit());
        existing.setPeriod(payload.getPeriod());

        Budget saved = budgetRepository.save(existing);

        Map<String, BigDecimal> spentByCategory = calculateSpentByCategory(customer);
        BigDecimal spent = spentByCategory.getOrDefault(saved.getCategory(), BigDecimal.ZERO);

        return ResponseEntity.ok(new BudgetResponse(saved, spent));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        Budget budget = getBudgetForCustomer(id, customer);
        budgetRepository.delete(budget);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBudgetStatus() {
        Customer customer = getCurrentCustomer();
        List<Budget> budgets = budgetRepository.findByCustomer(customer);
        Map<String, BigDecimal> spentByCategory = calculateSpentByCategory(customer);

        BigDecimal totalLimit = budgets.stream().map(Budget::getBudgetLimit).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = BigDecimal.ZERO;
        for (Budget b : budgets) {
            BigDecimal spent = spentByCategory.getOrDefault(b.getCategory(), BigDecimal.ZERO);
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
