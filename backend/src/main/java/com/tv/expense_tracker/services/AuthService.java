package com.tv.expense_tracker.services;

import com.tv.expense_tracker.exceptions.EmailAlreadyExistsException;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.CustomerRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public Customer signup(String fullName, String email, String password) {
        if (customerRepository.findByEmail(email).isPresent()) {
            // Throw a well-typed exception to be handled by a global exception handler
            throw new EmailAlreadyExistsException("Email is already created");
        }

        Customer customer = new Customer();
        customer.setFullName(fullName);
        customer.setEmail(email);
        customer.setPassword(passwordEncoder.encode(password));

        return customerRepository.save(customer);
    }
}