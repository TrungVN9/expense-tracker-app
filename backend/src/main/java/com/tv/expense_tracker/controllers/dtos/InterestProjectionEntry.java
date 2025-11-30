package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class InterestProjectionEntry {
    private String month; // label e.g., Jan 2025
    private BigDecimal interest;
    private BigDecimal balance;
}