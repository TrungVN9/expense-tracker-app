package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
