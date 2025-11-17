package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.services.CustomerUserDetailsService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * User Controller
 * Handles user profile endpoints
 */
@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final CustomerUserDetailsService customerUserDetailsService;
    private final CustomerRepository customerRepository;

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
                customer.getFullName(),
                customer.getUsername(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getDateOfBirth());

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

        // Use Optional for better null handling
        Optional<Customer> optionalCustomer = customerRepository.findByEmail(email);
        if (optionalCustomer.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Customer customerToUpdate = optionalCustomer.get();

        // Update fields from the request
        customerToUpdate.setFullName(updateRequest.getFullName());
        customerToUpdate.setUsername(updateRequest.getUsername());
        customerToUpdate.setPhone(updateRequest.getPhone());
        customerToUpdate.setAddress(updateRequest.getAddress());
        customerToUpdate.setDateOfBirth(updateRequest.getDateOfBirth());
        // In a real app, you might also update the email, which requires more complex logic (e.g., re-verification)
        // customerToUpdate.setEmail(updateRequest.getEmail());

        // Save the updated customer to the database
        Customer updatedCustomer = customerRepository.save(customerToUpdate);

        // Return the updated data
        UserDTO userDto = new UserDTO(
                updatedCustomer.getId(),
                updatedCustomer.getEmail(),
                updatedCustomer.getFullName(),
                updatedCustomer.getUsername(),
                updatedCustomer.getPhone(),
                updatedCustomer.getAddress(),
                updatedCustomer.getDateOfBirth());

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
        private String username;
        private String phone;
        private String address;
        private String dateOfBirth;
    }

    /**
     * Update User Request DTO
     */
    @Data
    public static class UpdateUserRequest {
        private String email;
        private String fullName;
        private String username;
        private String phone;
        private String address;
        private String dateOfBirth;
    }
}
