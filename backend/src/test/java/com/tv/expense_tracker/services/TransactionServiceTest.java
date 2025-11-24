package com.tv.expense_tracker.services;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    public void testCreateTransaction_Success() {
        Customer customer = new Customer();
        customer.setEmail("test@example.com");
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.of(customer));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArguments()[0]);

        Transaction transaction = new Transaction();
        Transaction createdTransaction = transactionService.createTransaction(transaction, "test@example.com");

        assertNotNull(createdTransaction);
        assertEquals(customer, createdTransaction.getCustomer());
    }

    @Test
    public void testCreateTransaction_UserNotFound() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            transactionService.createTransaction(new Transaction(), "test@example.com");
        });
    }

    @Test
    public void testGetTransactionsForUser_Success() {
        Customer customer = new Customer();
        customer.setEmail("test@example.com");
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.of(customer));
        when(transactionRepository.findByCustomerOrderByDateDesc(customer)).thenReturn(Collections.singletonList(new Transaction()));

        List<Transaction> transactions = transactionService.getTransactionsForUser("test@example.com");

        assertFalse(transactions.isEmpty());
    }

    @Test
    public void testGetTransactionsForUser_UserNotFound() {
        when(customerRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            transactionService.getTransactionsForUser("test@example.com");
        });
    }
}
