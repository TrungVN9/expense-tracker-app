# Design Patterns (mapped to Class Diagram)

**1. Singleton Pattern**

- **Intent:** Ensure a class has only one instance and provide a global point of access to it.
- **When to use:** For stateless utility components or centralized helpers where a single instance simplifies configuration and resource management (e.g., token utilities, configuration holders).
- **Implementation in backend:**
  - `JwtUtil` is a Spring-managed singleton bean annotated with `@Component` that provides JWT token generation and validation across the application.
  - `SecurityConfig` is a Spring `@Configuration` class that is instantiated once and manages the security filter chain for the entire application.
- **Collaborations:**
  - `JwtAuthFilter` depends on `JwtUtil` to extract and validate JWT tokens from incoming requests.
  - `AuthController` uses `JwtUtil` to generate tokens after successful authentication.
  - Both classes receive the singleton instance through constructor injection.
- **Consequences:** Controlled access to a single instance, easier caching and shared resources (like the JWT secret key). Ensures consistent token validation and generation across all requests.
- **Code reference:**
  ```java
  @Component
  public class JwtUtil {
      @Value("${jwt.secret}")
      private String secret;

      public String generateToken(UserDetails userDetails) { ... }
      public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) { ... }
  }
  ```

**2. Strategy Pattern**

- **Intent:** Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.
- **When to use:** When multiple ways exist to perform an operation (e.g., authentication strategies, fee calculation, export formats). Replace conditionals with polymorphism.
- **Implementation in backend:**
  - `UserDetailsService` is a Spring Security interface that defines the contract for loading user details.
  - `CustomerUserDetailsService` is the concrete implementation that fetches customer data from the `CustomerRepository` and converts it to Spring's `UserDetails` format.
  - The authentication mechanism uses this strategy to load user credentials from the database during authentication.
- **Collaborations:**
  - `SecurityConfig` configures Spring Security to use `CustomerUserDetailsService` as the strategy for user detail loading.
  - `JwtAuthFilter` uses `CustomerUserDetailsService.loadUserByUsername()` to retrieve user details for token validation.
  - `AuthenticationManager` uses the same strategy during login to authenticate credentials.
- **Consequences:**
  - Decouples authentication logic from user data source management.
  - Makes it easy to switch user loading strategies (e.g., from database to LDAP) without changing authentication code.
  - Improves testability by allowing mock implementations.
- **Code reference:**
  ```java
  @Service
  public class CustomerUserDetailsService implements UserDetailsService {
      private final CustomerRepository customerRepository;

      @Override
      public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
          Customer customer = customerRepository.findByEmail(email)
              .orElseThrow(() -> new UsernameNotFoundException("User not found"));
          return new User(customer.getEmail(), customer.getPassword(), new ArrayList<>());
      }
  }
  ```

**3. Template Method Pattern**

- **Intent:** Define the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the algorithm's structure.
- **When to use:** When you have a fixed sequence of steps (like authentication filtering) where some steps vary. Useful for cross-cutting concerns like logging, authentication, or request processing pipelines.
- **Implementation in backend:**
  - `JwtAuthFilter` extends Spring's `OncePerRequestFilter`, which is a template method pattern implementation.
  - The `doFilterInternal()` method defines the algorithm structure: extract token → validate token → set authentication context → proceed with request.
  - `OncePerRequestFilter` ensures the filter is applied exactly once per request (template method in base class).
- **Collaborations:**
  - `JwtAuthFilter.doFilterInternal()` follows the template defined by `OncePerRequestFilter`.
  - The filter orchestrates calls to `JwtUtil` for token extraction/validation and `CustomerUserDetailsService` for user details loading.
  - `SecurityConfig` registers `JwtAuthFilter` in the security filter chain.
- **Consequences:**
  - Ensures consistent filter execution behavior across all requests.
  - Simplifies security filter implementation by handling common concerns (once-per-request guarantee).
  - Makes it easy to add new filters by extending the base class.
- **Code reference:**
  ```java
  @Component
  public class JwtAuthFilter extends OncePerRequestFilter {
      @Override
      protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
              throws ServletException, IOException {
          String token = extractTokenFromHeader(request);
          if (token != null && jwtUtil.isValid(token, userDetails)) {
              // Set authentication context
          }
          filterChain.doFilter(request, response);
      }
  }
  ```

**4. Facade Pattern**

- **Intent:** Provide a unified, higher-level interface that simplifies interactions with a subsystem.
- **When to use:** Where controllers need a simple API to perform complex business operations that touch multiple services or repositories.
- **Implementation in backend:**
  - `AuthService` acts as a facade for the signup process, encapsulating customer creation, password encoding, and validation logic.
  - `TransactionService` acts as a facade for transaction management, handling customer lookup, transaction creation, and retrieval.
  - `SavingService` acts as a facade for savings account operations, managing savings accounts, transactions, and interest calculations.
- **Collaborations:**
  - Controllers (`AuthController`, `TransactionController`, `SavingController`) depend on the service layer facades.
  - Service layer internally orchestrates calls to repositories (`CustomerRepository`, `TransactionRepository`, `SavingRepository`) and utilities (`PasswordEncoder`, `JwtUtil`).
  - `TransactionController` calls `TransactionService.createTransaction()` without needing to know about customer lookup, entity persistence, or transaction coordination.
- **Consequences:**
  - Simplifies controller code by hiding business logic complexity.
  - Centralizes transaction management and business rules in the service layer.
  - Improves maintainability and testability.
  - Controllers remain thin and focused on HTTP handling.
- **Code reference:**
  ```java
  @Service
  @AllArgsConstructor
  public class TransactionService {
      private final TransactionRepository transactionRepository;
      private final CustomerRepository customerRepository;

      @Transactional
      public Transaction createTransaction(Transaction transaction, String userEmail) {
          Customer customer = customerRepository.findByEmail(userEmail)
              .orElseThrow(() -> new UsernameNotFoundException("User not found"));
          transaction.setCustomer(customer);
          return transactionRepository.save(transaction);
      }
  }
  ```

**5. Repository (Data Access Object) Pattern**

- **Intent:** Encapsulate data access logic and provide an abstraction layer between the business logic and the data source. The pattern abstracts the details of data persistence from domain objects.
- **When to use:** To decouple business logic from database-specific code, making the application more testable and flexible. Allows switching between different data sources without changing business logic.
- **Implementation in backend:**
  - `TransactionRepository`, `CustomerRepository`, `BillRepository`, `BudgetRepository`, `SavingRepository`, and `SavingTransactionRepository` all extend Spring Data's `JpaRepository` interface.
  - Each repository provides standardized CRUD operations and custom query methods (e.g., `findByCustomerOrderByDateDesc()`, `findByEmail()`).
  - Repositories abstract away SQL and database connection management.
- **Collaborations:**
  - Service layer classes (`TransactionService`, `AuthService`, `SavingService`) depend on repository interfaces, not concrete implementations.
  - Controllers never directly access repositories; they use service layer facades.
  - Spring automatically provides implementations of repository interfaces using proxy objects.
  - Custom query methods are executed via generated SQL queries.
- **Consequences:**
  - Clear separation between business logic and data persistence.
  - Easy to mock repositories for unit testing.
  - Can switch from JPA/Hibernate to another ORM or data source without changing service or controller code.
  - Provides a consistent API for CRUD operations across all entities.
- **Code reference:**

  ```java
  public interface TransactionRepository extends JpaRepository<Transaction, Long> {
      /**
       * Finds all transactions for a given customer, ordered by date descending.
       */
      List<Transaction> findByCustomerOrderByDateDesc(Customer customer);
  }

  // In TransactionService:
  @Service
  @AllArgsConstructor
  public class TransactionService {
      private final TransactionRepository transactionRepository;

      public List<Transaction> getTransactionsForUser(String userEmail) {
          Customer customer = customerRepository.findByEmail(userEmail).orElseThrow();
          return transactionRepository.findByCustomerOrderByDateDesc(customer);
      }
  }
  ```

---

### Layer Architecture and Pattern Distribution

1. **Controller Layer** (`@RestController`)

   - `AuthController`, `TransactionController`, `UserController`, `BillController`, `BudgetController`, `SavingController`
   - These are clients of the Facade pattern (Service layer)
   - Handle HTTP requests/responses and delegate business logic to services

2. **Service Layer** (`@Service`)

   - Implements the **Facade Pattern** by providing simplified, coarse-grained operations
   - `AuthService`: Encapsulates signup logic with password encoding
   - `TransactionService`: Manages transaction CRUD with customer validation
   - `SavingService`: Handles savings accounts, transactions, and interest calculations
   - `CustomerUserDetailsService`: Implements the **Strategy Pattern** for user detail loading

3. **Repository Layer** (`extends JpaRepository`)

   - Implements the **Repository/DAO Pattern** for data persistence
   - Provides both standard CRUD operations and custom query methods
   - Abstracts database interactions from business logic

4. **Security Layer** (`@Configuration`, `@Component`)
   - `JwtUtil`: **Singleton Pattern** - Spring-managed single instance for JWT operations
   - `JwtAuthFilter`: **Template Method Pattern** - extends `OncePerRequestFilter`
   - `SecurityConfig`: **Singleton Pattern** - manages application security configuration
