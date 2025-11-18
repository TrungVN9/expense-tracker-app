package com.tv.expense_tracker.repositories;

import com.tv.expense_tracker.models.Bill;
import com.tv.expense_tracker.models.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByCustomerOrderByDueDateAsc(Customer customer);

    List<Bill> findByCustomerAndDueDateAfterOrderByDueDateAsc(Customer customer, LocalDate from);
}
