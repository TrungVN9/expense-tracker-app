package com.tv.expense_tracker.repositories;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    /**
     * Finds all transactions for a given customer, ordered by date descending.
     * @param customer The customer to find transactions for.
     * @return A page of transactions.
     */
    List<Transaction> findByCustomerOrderByDateDesc(Customer customer);
}
