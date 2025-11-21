package com.tv.expense_tracker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tv.expense_tracker.controllers.dtos.LoginRequest;
import com.tv.expense_tracker.models.Customer;
import com.tv.expense_tracker.repositories.BillRepository;
import com.tv.expense_tracker.repositories.BudgetRepository;
import com.tv.expense_tracker.repositories.CustomerRepository;
import com.tv.expense_tracker.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ExpenseTrackerApplicationTests {

	@Autowired
	private ApplicationContext applicationContext;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CustomerRepository customerRepository;

	@Autowired
	private TransactionRepository transactionRepository;

	@Autowired
	private BillRepository billRepository;

	@Autowired
	private BudgetRepository budgetRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private ObjectMapper objectMapper;

	@BeforeEach
	public void setup() {
		billRepository.deleteAll();
		budgetRepository.deleteAll();
		transactionRepository.deleteAll();
		customerRepository.deleteAll();
	}

	@Test
	void contextLoads() {
		assertNotNull(applicationContext, "The application context should not be null");
	}

	@Test
	void testLogin_Success() throws Exception {
		// Create a test user
		Customer customer = new Customer();
		customer.setFullName("Test User");
		customer.setEmail("test@example.com");
		customer.setPassword(passwordEncoder.encode("password"));
		customerRepository.save(customer);

		// Create a login request
		LoginRequest loginRequest = new LoginRequest();
		loginRequest.setEmail("test@example.com");
		loginRequest.setPassword("password");

		// Perform the login request
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(loginRequest)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").exists());
	}
}
