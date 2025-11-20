1. Repository Pattern

  The Repository Pattern is used to decouple the business logic from the data access logic. It provides an abstraction layer over
   the data source, allowing to change the underlying data storage without affecting the business logic.

  In the backend code, the JpaRepository interfaces are a clear implementation of the Repository pattern. For example:

   * BillRepository.java:

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByCustomerOrderByDueDateAsc(Customer customer);
    List<Bill> findByCustomerAndDueDateAfterOrderByDueDateAsc(Customer customer, LocalDate from);
      }
* BudgetRepository.java:
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByCustomer(Customer customer);
  }

* CustomerRepository.java:

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);}

* TransactionRepository.java:

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByCustomerOrderByDateDesc(Customer customer);
  }

  By using these repositories, the services (e.g., AuthService, TransactionService) can interact with the database without being
  tied to a specific implementation. This makes the code more modular, testable, and easier to maintain.

  2. Singleton Pattern

  The Singleton Pattern ensures that a class has only one instance and provides a global point of access to it. In the context of
   the Spring Boot application, this pattern is managed by the Spring framework's Inversion of Control (IoC) container.

  By default, Spring creates beans as singletons. This means that when annotate a class with @Service, @Repository,
  @Component, or @RestController, Spring will create only one instance of that class and reuse it throughout the application.

  For example, in TransactionService.java:

   1 @Service
   2 @AllArgsConstructor
   3 public class TransactionService {
   4     // ...
   5 }

  Spring ensures that there is only one instance of TransactionService in the application. This is beneficial for performance and
  memory management, as it avoids the overhead of creating new objects for every request.

  Other Design Patterns

  In addition to the Repository and Singleton patterns, the backend code also utilizes several other design patterns, including:

   * Dependency Injection (DI): This is a core principle of the Spring framework and is used extensively throughout the code. For
     example, in AuthController, the AuthService, JwtUtil, and other dependencies are injected into the constructor. This promotes
     loose coupling and makes the code more modular and testable.
   * Front Controller: The Spring DispatcherServlet acts as a front controller, handling all incoming HTTP requests and dispatching
      them to the appropriate controllers.
   * Data Transfer Object (DTO): are using DTOs (e.g., TransactionDTO, UserDTO) to transfer data between the controllers and
     the clients. This helps to decouple the internal domain models from the external API.