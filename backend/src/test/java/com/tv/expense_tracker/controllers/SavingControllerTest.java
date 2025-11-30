package com.tv.expense_tracker.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.controllers.dtos.AmountRequest;
import com.tv.expense_tracker.controllers.dtos.SavingRequest;
import com.tv.expense_tracker.controllers.dtos.TransferRequest;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.models.Saving;
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
import static org.hamcrest.Matchers.is;


@SpringBootTest
@AutoConfigureMockMvc
public class SavingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SavingRepository savingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private SavingTransactionRepository savingTransactionRepository;

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
    public void testGetSavings_Success() throws Exception {
        Saving saving = new Saving();
        saving.setName("Emergency Fund");
        saving.setAccountType("hysa");
        saving.setBalance(new BigDecimal("10000.00"));
        saving.setCustomer(testCustomer);
        savingRepository.save(saving);

        mockMvc.perform(get("/api/savings").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Emergency Fund"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testCreateSaving_Success() throws Exception {
        SavingRequest savingRequest = new SavingRequest();
        savingRequest.setAccountName("Vacation Fund");
        savingRequest.setAccountType("other");
        savingRequest.setBalance(new BigDecimal("500.00"));

        mockMvc.perform(post("/api/savings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(savingRequest))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Vacation Fund"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testUpdateSaving_Success() throws Exception {
        Saving saving = new Saving();
        saving.setName("Old Name");
        saving.setAccountType("other");
        saving.setBalance(new BigDecimal("100.00"));
        saving.setCustomer(testCustomer);
        saving = savingRepository.save(saving);

        SavingRequest savingRequest = new SavingRequest();
        savingRequest.setAccountName("New Name");
        savingRequest.setAccountType("hysa");
        savingRequest.setBalance(new BigDecimal("200.00"));

        mockMvc.perform(put("/api/savings/" + saving.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(savingRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.balance").value(200.00));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testDeleteSaving_Success() throws Exception {
        Saving saving = new Saving();
        saving.setName("To Delete");
        saving.setAccountType("other");
        saving.setBalance(new BigDecimal("50.00"));
        saving.setCustomer(testCustomer);
        saving = savingRepository.save(saving);

        mockMvc.perform(delete("/api/savings/" + saving.getId()).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testDeposit_Success() throws Exception {
        Saving saving = new Saving();
        saving.setName("Test Account");
        saving.setAccountType("hysa");
        saving.setBalance(new BigDecimal("1000.00"));
        saving.setCustomer(testCustomer);
        saving = savingRepository.save(saving);

        AmountRequest depositRequest = new AmountRequest();
        depositRequest.setAmount(new BigDecimal("200.00"));
        depositRequest.setDescription("Monthly savings deposit");

        mockMvc.perform(post("/api/savings/" + saving.getId() + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(depositRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance", is(1200.00)));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testWithdraw_Success() throws Exception {
        Saving saving = new Saving();
        saving.setName("Test Account");
        saving.setAccountType("hysa");
        saving.setBalance(new BigDecimal("1000.00"));
        saving.setCustomer(testCustomer);
        saving = savingRepository.save(saving);

        AmountRequest withdrawRequest = new AmountRequest();
        withdrawRequest.setAmount(new BigDecimal("200.00"));
        withdrawRequest.setDescription("ATM withdrawal");

        mockMvc.perform(post("/api/savings/" + saving.getId() + "/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(withdrawRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance", is(800.00)));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testTransfer_Success() throws Exception {
        Saving fromSaving = new Saving();
        fromSaving.setName("From Account");
        fromSaving.setAccountType("hysa");
        fromSaving.setBalance(new BigDecimal("1000.00"));
        fromSaving.setCustomer(testCustomer);
        fromSaving = savingRepository.save(fromSaving);

        Saving toSaving = new Saving();
        toSaving.setName("To Account");
        toSaving.setAccountType("other");
        toSaving.setBalance(new BigDecimal("500.00"));
        toSaving.setCustomer(testCustomer);
        toSaving = savingRepository.save(toSaving);

        TransferRequest transferRequest = new TransferRequest();
        transferRequest.setFromId(fromSaving.getId());
        transferRequest.setToId(toSaving.getId());
        transferRequest.setAmount(new BigDecimal("300.00"));
        transferRequest.setDescription("Transfer to another account");

        mockMvc.perform(post("/api/savings/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transferRequest))
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
