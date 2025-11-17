package com.tv.expense_tracker.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Setter
@Getter
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String type; // e.g., "income" or "expense"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    public Transaction() {}

    public Transaction(String description, BigDecimal amount, LocalDate date, String category, String type, Customer customer) {
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.type = type;
        this.customer = customer;
    }
}
