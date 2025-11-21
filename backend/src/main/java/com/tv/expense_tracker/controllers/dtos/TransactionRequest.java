package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequest {
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private String category;
    private String type;
}
