package com.tv.expense_tracker.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private BigDecimal budgetLimit;

    private String period; // monthly, weekly, yearly

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    public Budget() {
    }

    public Budget(String category, BigDecimal budget_limit, String period, Customer customer) {
        this.category = category;
        this.budget_limit = budget_limit;
        this.period = period;
        this.customer = customer;
    }
}
