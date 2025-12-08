package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.CustomerRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final CustomerRepository customerRepository;

    private Customer getCurrentCustomer() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserDTO toUserDTO(Customer customer) {
        return new UserDTO(
                customer.getId(),
                customer.getEmail(),
                customer.getFullName(),
                customer.getUsername(),
                customer.getPhone(),
                customer.getAddress(),
                customer.getDateOfBirth(),
                customer.getOccupation());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        Customer customer = getCurrentCustomer();
        return ResponseEntity.ok(toUserDTO(customer));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateCurrentUser(@RequestBody UpdateUserRequest updateRequest) {
        Customer customerToUpdate = getCurrentCustomer();

        customerToUpdate.setFullName(updateRequest.getFullName());
        customerToUpdate.setUsername(updateRequest.getUsername());
        customerToUpdate.setPhone(updateRequest.getPhone());
        customerToUpdate.setAddress(updateRequest.getAddress());
        customerToUpdate.setDateOfBirth(updateRequest.getDateOfBirth());
        customerToUpdate.setOccupation(updateRequest.getOccupation());

        Customer updatedCustomer = customerRepository.save(customerToUpdate);

        return ResponseEntity.ok(toUserDTO(updatedCustomer));
    }

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
        private String occupation;
    }

    @Data
    public static class UpdateUserRequest {
        private String email;
        private String fullName;
        private String username;
        private String phone;
        private String address;
        private String dateOfBirth;
        private String occupation;
    }
}
