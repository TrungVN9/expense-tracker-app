package com.tv.expense_tracker.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CustomerRepository customerRepository;

    private Customer testCustomer;

    @BeforeEach
    public void setup() {
        customerRepository.deleteAll();
        testCustomer = new Customer();
        testCustomer.setEmail("test@example.com");
        testCustomer.setPassword("password");
        testCustomer.setFullName("Test User");
        customerRepository.save(testCustomer);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testGetCurrentUser_Success() throws Exception {
        mockMvc.perform(get("/api/users/me").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.fullName").value("Test User"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    public void testUpdateCurrentUser_Success() throws Exception {
        UserController.UpdateUserRequest updateRequest = new UserController.UpdateUserRequest();
        updateRequest.setFullName("Updated Test User");
        updateRequest.setPhone("1234567890");

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Test User"))
                .andExpect(jsonPath("$.phone").value("1234567890"));
    }
}
