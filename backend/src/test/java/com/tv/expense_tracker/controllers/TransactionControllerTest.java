package com.tv.expense_tracker.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.controllers.dtos.TransactionRequest;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Transaction;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.TransactionRepository;
import com.tv.expense_tracker.services.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TransactionService transactionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @BeforeEach
    public void setup() {
        transactionRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testCreateTransaction_Success() throws Exception {
        // Create a test user
        Customer customer = new Customer();
        customer.setFullName("Test User");
        customer.setEmail("test@example.com");
        customer.setPassword("password");
        customerRepository.save(customer);

        TransactionRequest transactionRequest = new TransactionRequest();
        transactionRequest.setDescription("Test Transaction");
        transactionRequest.setAmount(BigDecimal.valueOf(100.00));
        transactionRequest.setDate(LocalDate.now());
        transactionRequest.setCategory("Test");
        transactionRequest.setType("expense");

        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setDescription("Test Transaction");
        transaction.setAmount(BigDecimal.valueOf(100.00));
        transaction.setDate(LocalDate.now());
        transaction.setCategory("Test");
        transaction.setType("expense");
        transaction.setCustomer(customer);

        when(transactionService.createTransaction(any(Transaction.class), any(String.class))).thenReturn(transaction);

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionRequest))
                .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.description").value("Test Transaction"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testGetUserTransactions_Success() throws Exception {
        // Create a test user
        Customer customer = new Customer();
        customer.setFullName("Test User");
        customer.setEmail("test@example.com");
        customer.setPassword("password");
        customerRepository.save(customer);

        Transaction transaction = new Transaction();
        transaction.setId(1L);
        transaction.setDescription("Test Transaction");
        transaction.setAmount(BigDecimal.valueOf(100.00));
        transaction.setDate(LocalDate.now());
        transaction.setCategory("Test");
        transaction.setType("expense");
        transaction.setCustomer(customer);

        when(transactionService.getTransactionsForUser(any(String.class))).thenReturn(Collections.singletonList(transaction));

        mockMvc.perform(get("/api/transactions")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].description").value("Test Transaction"));
    }
}