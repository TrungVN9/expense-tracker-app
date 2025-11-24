# Backend Design Patterns

## 1. Foundational Architectural Pattern

### Layered (N-Tier) Architecture
- The application is structured into distinct layers, each with a specific responsibility. This separation of concerns is fundamental to the design, ensuring a clean and organized structure.
- **Implementation**:
    - **Presentation Layer (`controllers` package)**: Handles incoming HTTP requests, delegates to the business layer, and returns responses.
    - **Business Logic Layer (`services` package)**: Contains the core application logic, business rules, and orchestrates operations.
    - **Data Access Layer (`repositories` package)**: Manages data persistence, retrieval, and communication with the database.
- **Benefits**:
    - **Modularity**: Each layer can be developed and updated independently.
    - **Testability**: Layers can be tested in isolation.
    - **Maintainability**: The clear separation makes the code easier to understand and manage.
    - **Clear Dependency Flow**: Dependencies move in one direction: `Controller` → `Service` → `Repository`.

## 2. Core Principle: Inversion of Control (IoC) & Dependency Injection (DI)

### Spring IoC Container, Dependency Injection, and Singletons
- This is the backbone of the application's architecture. Instead of objects creating their own dependencies (e.g., a service creating a repository instance), the Spring Inversion of Control (IoC) container creates and "injects" them where needed. By default, these managed objects (Beans) are **Singletons**, meaning only one instance is created and shared throughout the application.
- **Implementation**:
    - **Constructor Injection**: Dependencies are provided through class constructors, which is the recommended approach (e.g., `AuthService` is injected into `AuthController`).
    - **Stereotype Annotations**: Classes annotated with `@Service`, `@Repository`, `@RestController`, and `@Component` are automatically detected and managed by Spring as singleton beans.
- **Benefits**:
    - **Loose Coupling**: Components are not tied to concrete implementations, making the system flexible.
    - **High Testability**: Dependencies can be easily replaced with mock objects in unit tests.
    - **Centralized Management**: The lifecycle and configuration of objects are managed centrally by Spring.

## 3. Structural Patterns

### Facade Pattern
- The Service layer acts as a facade, providing a simple, high-level interface to a more complex subsystem (the business logic).
- **Implementation**: Controllers interact with services through simple method calls like `transactionService.createTransaction()`. The service itself hides the complexity of validating data, interacting with repositories, and handling business rules.
- **Benefits**: Simplifies the client (the controller), decouples it from complex internal workings, and makes the business logic easier to refactor.

### Repository (and DAO) Pattern
- This pattern abstracts the data access mechanism. It provides a clean API for the business layer to interact with the data source without knowing the underlying implementation (e.g., JPA, JDBC). Spring Data repositories are a modern implementation of this pattern, evolving from the classic Data Access Object (DAO).
- **Implementation**: All repository interfaces (e.g., `TransactionRepository`, `CustomerRepository`) extend `JpaRepository`. This provides standard CRUD operations out-of-the-box and allows for custom, descriptive query methods like `findByEmail()` or `findByCustomerOrderByDueDateAsc()`.
- **Benefits**: Decouples business logic from data persistence, makes the data source swappable, and significantly reduces boilerplate data access code.

### Data Transfer Object (DTO) Pattern
- DTOs are plain objects used to transfer data between different layers, especially between the client (frontend) and the server. They help decouple the API contract from the internal domain model.
- **Implementation**: Classes like `SignupRequest`, `AuthResponse`, and `TransactionDTO` are used to define the expected structure of data for API requests and responses. They are often used with validation annotations.
- **Benefits**: Prevents exposing internal database entities in the API, provides a stable and clear contract for clients, and can be tailored for specific frontend views.

### Global Exception Handler (via `@ControllerAdvice`)
- This is a variation of an interceptor pattern applied to exception handling. A global handler centralizes the logic for catching exceptions from controllers and converting them into consistent, user-friendly HTTP responses.
- **Implementation**: The `RestExceptionHandler` class is annotated with `@ControllerAdvice`. It contains methods annotated with `@ExceptionHandler` that catch specific exceptions (e.g., `EmailAlreadyExistsException`) and return a standardized error response.
- **Benefits**: Avoids repetitive `try-catch` blocks in controllers, ensures consistent error responses across the entire API, and separates error handling from business logic.

## 4. Behavioral Patterns

### Strategy Pattern
- This pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from the clients that use it.
- **Implementation**: The security configuration uses a strategy-like approach. `JwtUtil` provides the strategy for creating and validating JWTs, while `CustomerUserDetailsService` provides the strategy for loading user data. These are used by the `JwtAuthFilter` to authenticate requests.
- **Benefits**: Allows different authentication strategies (e.g., JWT, OAuth2, session-based) to be swapped or configured without changing the core application flow.

### Chain of Responsibility Pattern
- This pattern creates a chain of processing objects for a request. Each object in the chain decides either to process the request or to pass it to the next object in the chain.
- **Implementation**: Spring Security's `FilterChain` is a perfect example. An incoming HTTP request passes through a series of filters (`JwtAuthFilter`, `UsernamePasswordAuthenticationFilter`, etc.). Each filter performs a specific security check (e.g., validating a token, checking credentials) before allowing the request to proceed.
- **Benefits**: Decouples the sender of a request from its receivers, allows for flexible ordering and addition of new processing steps (filters), and makes each step responsible for a single task.

## 5. Domain-Specific Patterns

### Domain Model Pattern
- The core of the application is modeled around business objects (Entities) that represent real-world concepts from the application's domain. These objects contain both data (attributes) and the relationships between them.
- **Implementation**: JPA entities like `Customer`, `Transaction`, `Bill`, and `Budget` are defined with JPA annotations (`@Entity`, `@OneToMany`, `@ManyToOne`) to model the data and its relationships.
- **Benefits**: Creates a rich, expressive, and easy-to-understand model of the business domain, which serves as the foundation for the entire application.

### Exception Wrapper Pattern
- Custom, domain-specific exceptions are created to represent specific business rule violations or error conditions.
- **Implementation**: `EmailAlreadyExistsException` is a custom exception that clearly signals a specific domain error, rather than using a generic exception like `IllegalArgumentException`.
- **Benefits**: Provides more meaningful and specific error information, which improves debugging and allows for more precise error handling by the application.
