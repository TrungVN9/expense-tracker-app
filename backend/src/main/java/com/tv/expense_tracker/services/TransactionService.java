package com.tv.expense_tracker.services;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.TransactionRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;

    /**
     * Creates a new transaction and associates it with the authenticated user.
     *
     * @param transaction The transaction to create.
     * @param userEmail The email of the authenticated user.
     * @return The saved transaction.
     */
    @Transactional
    public Transaction createTransaction(Transaction transaction, String userEmail) {
        Customer customer = customerRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));
        transaction.setCustomer(customer);
        return transactionRepository.save(transaction);
    }

    /**
     * Retrieves a paginated list of transactions for the authenticated user.
     *
     * @param userEmail The email of the authenticated user.
     * @return A list of transactions.
     */
    @Transactional(readOnly = true)
    public List<Transaction> getTransactionsForUser(String userEmail) {
        Customer customer = customerRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));
        return transactionRepository.findByCustomerOrderByDateDesc(customer);
    }
}
