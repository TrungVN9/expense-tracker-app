package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
public class SavingResponse {
    private Long id;
    private String name;
    private String accountType;
    private BigDecimal balance;
    private BigDecimal interestRate;
    private BigDecimal goal;
    private String description;
    private Instant createdAt;
    private Instant updatedAt;
}
