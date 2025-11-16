package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.securities.JwtUtil;
import com.tv.expense_tracker.services.AuthService;
import com.tv.expense_tracker.services.CustomerUserDetailsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles user login and signup endpoints
 */
@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomerUserDetailsService customerUserDetailsService;

    /**
     * User signup endpoint
     * 
     * @param request SignupRequest containing fullName, email, password
     * @return AuthResponse with JWT token
     */
    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        Customer customer = authService.signup(request.fullName, request.email, request.password);
        final UserDetails userDetails = customerUserDetailsService.loadUserByUsername(customer.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token);
    }

    /**
     * User login endpoint
     * 
     * @param request LoginRequest containing email and password
     * @return AuthResponse with JWT token
     */
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email, request.password));
        final UserDetails userDetails = customerUserDetailsService.loadUserByUsername(request.email);
        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token);
    }

    /**
     * Auth Response DTO
     */
    @Data
    @AllArgsConstructor
    static class AuthResponse {
        private String token;
    }

    /**
     * Signup Request DTO
     */
    @Data
    static class SignupRequest {
        public String fullName;
        public String email;
        public String password;
    }

    /**
     * Login Request DTO
     */
    @Data
    static class LoginRequest {
        public String email;
        public String password;
    }
}
