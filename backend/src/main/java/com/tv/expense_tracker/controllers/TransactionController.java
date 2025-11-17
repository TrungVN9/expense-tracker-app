package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.services.TransactionService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@AllArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Endpoint to create a new transaction for the authenticated user.
     * 
     * @param request The transaction details.
     * @return The created transaction.
     */
    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        Transaction transaction = new Transaction();
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setCategory(request.getCategory());
        transaction.setType(request.getType());

        Transaction createdTransaction = transactionService.createTransaction(transaction, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionDTO(createdTransaction));
    }

    /**
     * Endpoint to get all transactions for the authenticated user with pagination.
     * 
     * @return A list of transactions.
     */
    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getUserTransactions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        List<Transaction> transactions = transactionService.getTransactionsForUser(userEmail);
        List<TransactionDTO> transactionDTOs = transactions.stream().map(TransactionDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(transactionDTOs);
    }

    /**
     * DTO for creating a transaction.
     */
    @Data
    public static class TransactionRequest {
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String category;
        private String type;
    }

    /**
     * DTO for returning transaction details.
     */
    @Data
    public static class TransactionDTO {
        private Long id;
        private String description;
        private BigDecimal amount;
        private LocalDate date;
        private String category;
        private String type;

        public TransactionDTO(Transaction transaction) {
            this.id = transaction.getId();
            this.description = transaction.getDescription();
            this.amount = transaction.getAmount();
            this.date = transaction.getDate();
            this.category = transaction.getCategory();
            this.type = transaction.getType();
        }
    }
}