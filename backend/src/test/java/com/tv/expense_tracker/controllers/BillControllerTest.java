package com.tv.expense_tracker.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.models.Bill;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.BillRepository;
import com.tv.expense_tracker.repositories.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BillControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private Customer testCustomer;

    @BeforeEach
    public void setup() {
        billRepository.deleteAll();
        customerRepository.deleteAll();
        testCustomer = new Customer();
        testCustomer.setEmail("test@example.com");
        testCustomer.setPassword("password");
        testCustomer.setFullName("Test User");
        customerRepository.save(testCustomer);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testGetBills_Success() throws Exception {
        Bill bill1 = new Bill();
        bill1.setName("Bill 1");
        bill1.setAmount(BigDecimal.valueOf(100));
        bill1.setDueDate(LocalDate.now().plusDays(10));
        bill1.setCustomer(testCustomer);
        billRepository.save(bill1);

        mockMvc.perform(get("/api/bills").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Bill 1"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testCreateBill_Success() throws Exception {
        Bill bill = new Bill();
        bill.setName("New Bill");
        bill.setAmount(BigDecimal.valueOf(200));
        bill.setDueDate(LocalDate.now().plusDays(20));

        mockMvc.perform(post("/api/bills")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bill))
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Bill"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testUpdateBill_Success() throws Exception {
        Bill bill = new Bill();
        bill.setName("Old Bill");
        bill.setAmount(BigDecimal.valueOf(150));
        bill.setDueDate(LocalDate.now().plusDays(5));
        bill.setCustomer(testCustomer);
        bill = billRepository.save(bill);

        Bill updatedBill = new Bill();
        updatedBill.setName("Updated Bill");
        updatedBill.setAmount(BigDecimal.valueOf(175));
        updatedBill.setDueDate(LocalDate.now().plusDays(7));

        mockMvc.perform(put("/api/bills/" + bill.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBill))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Bill"))
                .andExpect(jsonPath("$.amount").value(175));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testDeleteBill_Success() throws Exception {
        Bill bill = new Bill();
        bill.setName("To Delete");
        bill.setAmount(BigDecimal.valueOf(50));
        bill.setDueDate(LocalDate.now().plusDays(1));
        bill.setCustomer(testCustomer);
        bill = billRepository.save(bill);

        mockMvc.perform(delete("/api/bills/" + bill.getId()).with(csrf()))
                .andExpect(status().isNoContent());
    }
    
    @Test
    @WithMockUser(username = "test@example.com")
    public void testPayBill_Success() throws Exception {
        Bill bill = new Bill();
        bill.setName("To Pay");
        bill.setAmount(BigDecimal.valueOf(120));
        bill.setDueDate(LocalDate.now().plusDays(3));
        bill.setStatus("pending");
        bill.setCustomer(testCustomer);
        bill = billRepository.save(bill);

        mockMvc.perform(post("/api/bills/" + bill.getId() + "/pay").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("paid"));
    }
}
