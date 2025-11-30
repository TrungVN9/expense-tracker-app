package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AmountRequest {
    private BigDecimal amount;
    private String description;
}