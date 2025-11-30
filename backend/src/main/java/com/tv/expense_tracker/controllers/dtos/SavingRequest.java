package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SavingRequest {
    private String accountName;
    private String accountType;
    private BigDecimal balance;
    private BigDecimal interestRate;
    private BigDecimal goal;
    private String description;
}
