package com.tv.expense_tracker.controllers.dtos;

import com.tv.expense_tracker.models.Transaction;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionDTO {
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
