package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.services.CustomerUserDetailsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * User Controller
 * Handles user profile endpoints
 */
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final CustomerUserDetailsService customerUserDetailsService;

    /**
     * Get current authenticated user profile
     * 
     * @return UserDTO containing user details
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Customer customer = customerUserDetailsService.findCustomerByEmail(email);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }

        UserDTO userDto = new UserDTO(
                customer.getId(),
                customer.getEmail(),
                customer.getFullName());

        return ResponseEntity.ok(userDto);
    }

    /**
     * Update current user profile
     * 
     * @param updateRequest The user data to update
     * @return Updated UserDTO
     */
    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@RequestBody UpdateUserRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        Customer customer = customerUserDetailsService.findCustomerByEmail(email);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }

        // Update fields if provided
        if (updateRequest.fullName != null && !updateRequest.fullName.isEmpty()) {
            customer.setFullName(updateRequest.fullName);
        }

        // Note: In production, save the updated customer to database
        // For now, we're just returning the updated info

        UserDTO userDto = new UserDTO(
                customer.getId(),
                customer.getEmail(),
                customer.getFullName());

        return ResponseEntity.ok(userDto);
    }

    /**
     * User Data Transfer Object
     */
    @Data
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String email;
        private String fullName;
    }

    /**
     * Update User Request DTO
     */
    @Data
    public static class UpdateUserRequest {
        public String fullName;
    }
}
