package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
public class SavingTransactionResponse {
    private Long id;
    private String type;
    private BigDecimal amount;
    private String description;
    private Instant createdAt;
}