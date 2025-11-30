package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {
    private Long fromId;
    private Long toId;
    private BigDecimal amount;
    private String description;
}