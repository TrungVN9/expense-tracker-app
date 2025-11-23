package com.tv.expense_tracker.services;

import com.tv.expense_tracker.exceptions.EmailAlreadyExistsException;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    public void testSignup_Success() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArguments()[0]);

        Customer customer = authService.signup("Test User", "test@example.com", "password");

        assertNotNull(customer);
        assertEquals("Test User", customer.getFullName());
        assertEquals("test@example.com", customer.getEmail());
        assertEquals("encodedPassword", customer.getPassword());
    }

    @Test
    public void testSignup_EmailAlreadyExists() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new Customer()));

        assertThrows(EmailAlreadyExistsException.class, () -> {
            authService.signup("Test User", "test@example.com", "password");
        });
    }
}
