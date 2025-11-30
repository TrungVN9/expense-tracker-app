package com.tv.expense_tracker.repositories;

import com.tv.expense_tracker.models.Saving;
import com.tv.expense_tracker.models.SavingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavingTransactionRepository extends JpaRepository<SavingTransaction, Long> {
    List<SavingTransaction> findBySavingOrderByCreatedAtDesc(Saving saving);
}