package com.tv.expense_tracker.controllers.dtos;

import lombok.Data;

@Data
public class SignupRequest {
    private String fullName;
    private String email;
    private String password;
}
