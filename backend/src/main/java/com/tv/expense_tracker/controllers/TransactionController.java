package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.controllers.dtos.TransactionDTO;
import com.tv.expense_tracker.controllers.dtos.TransactionRequest;
import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.services.TransactionService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@AllArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionRequest request) {
        String userEmail = getCurrentUserEmail();

        Transaction transaction = new Transaction();
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setCategory(request.getCategory());
        transaction.setType(request.getType());

        Transaction createdTransaction = transactionService.createTransaction(transaction, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(new TransactionDTO(createdTransaction));
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getUserTransactions() {
        String userEmail = getCurrentUserEmail();

        List<Transaction> transactions = transactionService.getTransactionsForUser(userEmail);
        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(TransactionDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(transactionDTOs);
    }
}