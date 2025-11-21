package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.controllers.dtos.AuthResponse;
import com.tv.expense_tracker.controllers.dtos.LoginRequest;
import com.tv.expense_tracker.controllers.dtos.SignupRequest;
import com.tv.expense_tracker.securities.JwtUtil;
import com.tv.expense_tracker.services.AuthService;
import com.tv.expense_tracker.services.CustomerUserDetailsService;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomerUserDetailsService customerUserDetailsService;

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody SignupRequest request) {
        Customer customer = authService.signup(
                request.getFullName(),
                request.getEmail(),
                request.getPassword()
        );

        UserDetails userDetails =
                customerUserDetailsService.loadUserByUsername(customer.getEmail());

        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails userDetails =
                customerUserDetailsService.loadUserByUsername(request.getEmail());

        String token = jwtUtil.generateToken(userDetails);
        return new AuthResponse(token);
    }
}