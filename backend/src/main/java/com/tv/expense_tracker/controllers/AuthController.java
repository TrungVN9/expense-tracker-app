package com.tv.expense_tracker.controllers;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.services.AuthService;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public Customer signup(@RequestBody SignupRequest request) {
        return authService.signup(request.fullName, request.email, request.password);
    }

    @PostMapping("/login")
    public Customer login(@RequestBody LoginRequest request) {
        return authService.login(request.email, request.password);
    }

    @Data
    static class SignupRequest {
        public String fullName;
        public String email;
        public String password;
    }

    @Data
    static class LoginRequest {
        public String email;
        public String password;
    }
}
