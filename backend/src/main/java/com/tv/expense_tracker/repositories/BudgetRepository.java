package com.tv.expense_tracker.repositories;

import com.tv.expense_tracker.models.Budget;
import com.tv.expense_tracker.models.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByCustomer(Customer customer);
}
