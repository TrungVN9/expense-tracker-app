package com.tv.expense_tracker.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.models.Budget;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SavingTransactionRepository savingTransactionRepository;

    @Autowired
    private SavingRepository savingRepository;

    private Customer testCustomer;

    @BeforeEach
    public void setup() {
        savingTransactionRepository.deleteAll();
        savingRepository.deleteAll();
        transactionRepository.deleteAll();
        billRepository.deleteAll();
        budgetRepository.deleteAll();
        customerRepository.deleteAll();
        testCustomer = new Customer();
        testCustomer.setEmail("test@example.com");
        testCustomer.setPassword("password");
        testCustomer.setFullName("Test User");
        customerRepository.save(testCustomer);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testGetBudgets_Success() throws Exception {
        Budget budget = new Budget();
        budget.setCategory("Groceries");
        budget.setBudgetLimit(BigDecimal.valueOf(500));
        budget.setPeriod("Monthly");
        budget.setCustomer(testCustomer);
        budgetRepository.save(budget);

        mockMvc.perform(get("/api/budgets").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].category").value("Groceries"))
                .andExpect(jsonPath("$[0].spent").value(0));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testCreateBudget_Success() throws Exception {
        Budget budget = new Budget();
        budget.setCategory("Entertainment");
        budget.setBudgetLimit(BigDecimal.valueOf(200));
        budget.setPeriod("Monthly");

        mockMvc.perform(post("/api/budgets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(budget))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category").value("Entertainment"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testUpdateBudget_Success() throws Exception {
        Budget budget = new Budget();
        budget.setCategory("Shopping");
        budget.setBudgetLimit(BigDecimal.valueOf(300));
        budget.setPeriod("Monthly");
        budget.setCustomer(testCustomer);
        budget = budgetRepository.save(budget);

        Budget updatedBudget = new Budget();
        updatedBudget.setCategory("Shopping");
        updatedBudget.setBudgetLimit(BigDecimal.valueOf(350));
        updatedBudget.setPeriod("Monthly");

        mockMvc.perform(put("/api/budgets/" + budget.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBudget))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.budgetLimit").value(350));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testDeleteBudget_Success() throws Exception {
        Budget budget = new Budget();
        budget.setCategory("To Delete");
        budget.setBudgetLimit(BigDecimal.valueOf(100));
        budget.setPeriod("Monthly");
        budget.setCustomer(testCustomer);
        budget = budgetRepository.save(budget);

        mockMvc.perform(delete("/api/budgets/" + budget.getId()).with(csrf()))
                .andExpect(status().isNoContent());
    }
}