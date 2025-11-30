package com.tv.expense_tracker.repositories;

import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingRepository extends JpaRepository<Saving, Long> {
    List<Saving> findByCustomer(Customer customer);
}
