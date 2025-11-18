package com.tv.expense_tracker.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate dueDate;

    private String category;

    private boolean recurring = false;

    private String frequency; // e.g., monthly, weekly

    @Column(nullable = false)
    private String status = "pending"; // paid, pending, overdue

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    public Bill() {
    }

    public Bill(String name, BigDecimal amount, LocalDate dueDate, String category, boolean recurring, String frequency,
            String status, Customer customer) {
        this.name = name;
        this.amount = amount;
        this.dueDate = dueDate;
        this.category = category;
        this.recurring = recurring;
        this.frequency = frequency;
        this.status = status;
        this.customer = customer;
    }
}
