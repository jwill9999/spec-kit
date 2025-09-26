# Testing Best Practices for Spec Kit

- **Always mock or stub external dependencies** (e.g., file system, network, git commands) in your tests. This ensures tests are fast, reliable, and do not cause side effects.
- **Do not create or delete real git branches** during tests. Use environment variables or dependency injection to skip or mock branch creation logic.
- **Clean up all files and directories created during tests** before and after each test to maintain a fresh state.
- **Test only the logic within your class or function**. Avoid relying on external state or resources.
- **Use unique identifiers** for test artifacts to prevent collisions between tests.
- **Keep tests isolated and independent** so they can run in any order.

_These practices help keep your test suite robust, maintainable, and safe for both local and CI/CD environments._
