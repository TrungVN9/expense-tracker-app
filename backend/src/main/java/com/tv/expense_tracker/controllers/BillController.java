package com.tv.expense_tracker.controllers;

import com.tv.expense_tracker.models.Bill;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.BillRepository;
import com.tv.expense_tracker.repositories.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;

    public BillController(BillRepository billRepository, CustomerRepository customerRepository) {
        this.billRepository = billRepository;
        this.customerRepository = customerRepository;
    }

    private Customer getCurrentCustomer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth != null ? auth.getName() : null;
        if (email == null)
            return null;
        return customerRepository.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getBills() {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        List<Bill> bills = billRepository.findByCustomerOrderByDueDateAsc(customer);
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Bill>> getUpcomingBills() {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        LocalDate today = LocalDate.now();
        List<Bill> bills = billRepository.findByCustomerAndDueDateAfterOrderByDueDateAsc(customer, today.minusDays(1));
        return ResponseEntity.ok(bills);
    }

    @PostMapping
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        bill.setCustomer(customer);
        Bill saved = billRepository.save(bill);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Long id, @RequestBody Bill payload) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Bill> existingOpt = billRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Bill existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        existing.setName(payload.getName());
        existing.setAmount(payload.getAmount());
        existing.setDueDate(payload.getDueDate());
        existing.setCategory(payload.getCategory());
        existing.setRecurring(payload.isRecurring());
        existing.setFrequency(payload.getFrequency());
        existing.setStatus(payload.getStatus());

        Bill saved = billRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Bill> existingOpt = billRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Bill existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        billRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Bill> payBill(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Bill> existingOpt = billRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Bill existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        existing.setStatus("paid");
        existing.setPaidDate(LocalDate.now());
        Bill saved = billRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/unpay")
    public ResponseEntity<Bill> unpayBill(@PathVariable Long id) {
        Customer customer = getCurrentCustomer();
        if (customer == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<Bill> existingOpt = billRepository.findById(id);
        if (existingOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Bill existing = existingOpt.get();
        if (!existing.getCustomer().getId().equals(customer.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        existing.setStatus("pending");
        existing.setPaidDate(null);
        Bill saved = billRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
}
