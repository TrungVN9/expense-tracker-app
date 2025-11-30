package com.tv.expense_tracker.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.controllers.dtos.LoginRequest;
import com.tv.expense_tracker.controllers.dtos.SignupRequest;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SavingTransactionRepository savingTransactionRepository;

    @Autowired
    private SavingRepository savingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @BeforeEach
    public void setup() {
        savingTransactionRepository.deleteAll();
        savingRepository.deleteAll();
        transactionRepository.deleteAll();
        billRepository.deleteAll();
        budgetRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    public void testSignup_Success() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setFullName("Test User");
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    public void testLogin_Success() throws Exception {
        // Create a test user
        Customer customer = new Customer();
        customer.setFullName("Test User");
        customer.setEmail("test@example.com");
        customer.setPassword(passwordEncoder.encode("password"));
        customerRepository.save(customer);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }
}