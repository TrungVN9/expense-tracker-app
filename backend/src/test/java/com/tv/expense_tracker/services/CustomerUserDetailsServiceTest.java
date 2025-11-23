package com.tv.expense_tracker.services;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomerUserDetailsServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerUserDetailsService customerUserDetailsService;

    @Test
    public void testLoadUserByUsername_Success() {
        Customer customer = new Customer();
        customer.setEmail("test@example.com");
        customer.setPassword("password");
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.of(customer));

        UserDetails userDetails = customerUserDetailsService.loadUserByUsername("test@example.com");

        assertNotNull(userDetails);
        assertEquals("test@example.com", userDetails.getUsername());
    }

    @Test
    public void testLoadUserByUsername_UserNotFound() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customerUserDetailsService.loadUserByUsername("test@example.com");
        });
    }

    @Test
    public void testFindCustomerByEmail_Success() {
        Customer customer = new Customer();
        customer.setEmail("test@example.com");
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.of(customer));

        Customer foundCustomer = customerUserDetailsService.findCustomerByEmail("test@example.com");

        assertNotNull(foundCustomer);
        assertEquals("test@example.com", foundCustomer.getEmail());
    }

    @Test
    public void testFindCustomerByEmail_NotFound() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        Customer foundCustomer = customerUserDetailsService.findCustomerByEmail("test@example.com");

        assertNull(foundCustomer);
    }
}
