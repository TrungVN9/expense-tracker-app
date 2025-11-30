package com.tv.expense_tracker.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "saving_transactions")
@Getter
@Setter
public class SavingTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saving_id", nullable = false)
    private Saving saving;

    @Column(nullable = false)
    private String type; // deposit, withdrawal, transfer_in, transfer_out

    @Column(nullable = false)
    private BigDecimal amount;

    @Lob
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}