# Contributor Testing Playbook

A practical guide for contributors who need to test changes before
submitting pull requests.

---

## Table of Contents

1. Introduction
2. Testing Philosophy
3. Before Testing
4. Test Planning
5. Unit Testing
6. Unit Testing Checklist
7. Integration Testing
8. Integration Testing Checklist
9. UI Testing
10. UI Testing Checklist
11. Form Testing
12. API Testing
13. Error Testing
14. Performance Testing
15. Accessibility Testing
16. Browser Testing
17. Responsive Testing
18. Regression Testing
19. Security Testing
20. Test Data
21. Mocking
22. Debugging
23. Bug Reporting
24. Testing Examples
25. Pull Request Testing
26. Final Checklist

---

# 1. Introduction

Testing helps contributors verify that changes work as expected and do
not introduce unnecessary regressions.

Every contribution should be tested according to its scope.

A documentation-only change may require basic formatting checks.

A user-interface change may require:

- Functional testing
- Browser testing
- Responsive testing
- Accessibility testing

An API change may require:

- Unit tests
- Integration tests
- Validation tests
- Error handling tests

The goal is not to maximize the number of tests.

The goal is to provide appropriate confidence that the change works.

---

# 2. Testing Philosophy

Good testing should be:

- Relevant
- Repeatable
- Understandable
- Maintainable
- Automated where practical
- Focused on expected behavior

Testing should verify both:

- Expected successful behavior
- Expected failure behavior

Contributors should test the change itself as well as nearby behavior
that could reasonably be affected.

---

# 3. Before Testing

Before running tests:

- [ ] Read the issue.
- [ ] Understand the requested behavior.
- [ ] Review existing implementation.
- [ ] Review existing tests.
- [ ] Identify affected files.
- [ ] Identify affected features.
- [ ] Check project instructions.
- [ ] Update the local branch.
- [ ] Install required dependencies.

Example:

```bash
git checkout master

git pull origin master

---

# 4. Unit Testing Practices

## Purpose

Unit tests verify the behavior of individual functions, components, classes, hooks, utilities, and services in isolation.

They should:

- Execute quickly
- Run without network dependencies
- Be deterministic
- Validate expected behavior
- Catch regressions early

## What Should Be Unit Tested

Contributors should create unit tests for:

- Utility functions
- Data transformation logic
- Validation rules
- Custom hooks
- Business logic
- Permission checks
- Event processing logic
- Error handling logic

## What Should Not Be Unit Tested

Avoid unit testing:

- Third-party libraries
- Framework internals
- Browser implementations
- Generated code

## Unit Test Structure

Follow the Arrange-Act-Assert pattern.

### Arrange

Prepare data.

### Act

Execute behavior.

### Assert

Verify outcome.

Example:

```javascript
describe("calculateTotal", () => {
  it("returns correct total", () => {
    const items = [
      { price: 10 },
      { price: 20 }
    ];

    const total = calculateTotal(items);

    expect(total).toBe(30);
  });
});
```

## Naming Conventions

Use descriptive test names.

Good:

```javascript
it("should return organizer permissions for event owner")
```

Good:

```javascript
it("should reject expired access token")
```

Bad:

```javascript
it("works")
```

Bad:

```javascript
it("test 1")
```

## Coverage Expectations

Target coverage:

| Area | Target |
|--------|---------|
| Utilities | 90%+ |
| Business Logic | 90%+ |
| Services | 80%+ |
| Components | 80%+ |

Coverage is a guideline rather than a strict requirement.

## Edge Cases

Every contributor should test:

- Empty input
- Null values
- Undefined values
- Invalid values
- Maximum values
- Minimum values
- Permission failures
- Timeout scenarios

## Mocking Guidelines

Mock only external dependencies.

Examples:

- APIs
- Databases
- External services
- Browser storage

Avoid mocking the code under test.

## Common Unit Test Checklist

- [ ] Happy path tested
- [ ] Failure path tested
- [ ] Edge cases tested
- [ ] No external dependencies
- [ ] Assertions are meaningful
- [ ] Test names are descriptive

---

# 5. Integration Testing Workflows

## Purpose

Integration testing verifies that multiple modules work together correctly.

Examples:

- API and database interactions
- Authentication flows
- Event creation workflows
- Notification systems
- Scheduling systems

## Integration Testing Goals

Verify:

- Correct communication between modules
- Correct database behavior
- Correct authorization handling
- Correct transaction processing

## Recommended Workflow

### Step 1

Start local environment.

### Step 2

Configure test database.

### Step 3

Seed required test data.

### Step 4

Run integration suite.

### Step 5

Review failures.

### Step 6

Fix issues and rerun.

## Example Areas

### User Registration

Verify:

- User creation
- Password hashing
- Token generation
- Email dispatch

### Event Creation

Verify:

- Validation
- Storage
- Permission checks
- Notifications

### Event Cancellation

Verify:

- State updates
- Notification delivery
- Audit logging

### Ticket Booking

Verify:

- Capacity handling
- Payment integration
- Confirmation generation

## Integration Test Checklist

- [ ] Database cleaned before run
- [ ] Test data isolated
- [ ] External systems mocked
- [ ] Assertions validate outcomes
- [ ] Side effects verified

---

# 6. UI Testing Checklist

## Purpose

UI testing validates user-facing behavior.

## Areas To Test

### Navigation

- [ ] Links work
- [ ] Routes load
- [ ] Back navigation works

### Forms

- [ ] Validation messages appear
- [ ] Required fields enforced
- [ ] Submission works
- [ ] Errors displayed correctly

### Buttons

- [ ] Click actions work
- [ ] Disabled states function
- [ ] Loading indicators appear

### Tables

- [ ] Data renders correctly
- [ ] Sorting works
- [ ] Filtering works
- [ ] Pagination works

### Modals

- [ ] Open correctly
- [ ] Close correctly
- [ ] Keyboard dismissal works

### Notifications

- [ ] Success messages display
- [ ] Error messages display
- [ ] Messages dismiss correctly

### Mobile Responsiveness

Test common widths:

- 320px
- 375px
- 768px
- 1024px
- 1440px

Checklist:

- [ ] Layout remains usable
- [ ] Text remains readable
- [ ] Buttons remain clickable

## Cross-Browser Testing

Verify behavior in:

- Chrome
- Firefox
- Edge
- Safari (when applicable)

---

# 7. Performance Testing Guide

## Goals

Performance testing ensures the application remains responsive under realistic load.

## Metrics To Observe

### Frontend

- First Contentful Paint
- Largest Contentful Paint
- Time To Interactive
- Layout Shift

### Backend

- Response Time
- Throughput
- CPU Usage
- Memory Usage

## Basic Performance Checklist

- [ ] Large pages load efficiently
- [ ] No excessive re-renders
- [ ] Queries optimized
- [ ] Memory leaks checked

## Load Testing

Recommended scenarios:

### Light Load

10 users

### Medium Load

100 users

### Heavy Load

500 users

### Stress Test

Beyond expected traffic

## Performance Regression Review

Verify:

- No significant response increase
- No unexpected resource growth
- No degraded user experience

---

# 8. Accessibility Testing Procedures

## Goal

Ensure the application is usable by everyone.

## Accessibility Principles

- Perceivable
- Operable
- Understandable
- Robust

## Keyboard Testing

Verify:

- [ ] All controls reachable
- [ ] Visible focus state
- [ ] No keyboard traps

## Screen Reader Testing

Verify:

- [ ] Labels announced
- [ ] Buttons described
- [ ] Forms understandable

## Color Testing

Verify:

- [ ] Sufficient contrast
- [ ] Information not conveyed solely by color

## Images

Verify:

- [ ] Meaningful images have alt text
- [ ] Decorative images ignored

## Forms

Verify:

- [ ] Labels connected
- [ ] Errors announced
- [ ] Instructions clear

## Accessibility Checklist

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Contrast requirements met
- [ ] Semantic HTML used

---

# 9. Bug Reporting Standards

## Purpose

Clear bug reports reduce investigation time.

## Required Information

### Title

Concise summary.

Example:

```text
Event organizer cannot edit published event
```

### Environment

Include:

- Browser
- Version
- Device
- Operating system

### Steps To Reproduce

Example:

1. Login
2. Open event
3. Click Edit
4. Save changes

### Expected Result

Describe intended behavior.

### Actual Result

Describe observed behavior.

### Evidence

Provide:

- Screenshots
- Videos
- Logs

## Severity Levels

### Critical

System unusable.

### High

Major functionality broken.

### Medium

Partial functionality affected.

### Low

Minor issue.

## Priority Levels

### P1

Immediate fix.

### P2

Next release.

### P3

Future release.

---

# 10. Testing Examples

## Example 1: Validation Test

```javascript
describe("email validation", () => {
  it("rejects invalid email", () => {
    expect(validateEmail("abc")).toBe(false);
  });
});
```

## Example 2: Permission Test

```javascript
describe("permissions", () => {
  it("blocks unauthorized users", () => {
    expect(canDeleteEvent("viewer")).toBe(false);
  });
});
```

## Example 3: API Test

```javascript
describe("GET /events", () => {
  it("returns events", async () => {
    const response = await request(app).get("/events");

    expect(response.status).toBe(200);
  });
});
```

## Example 4: Component Test

```javascript
render(<Button />);

expect(
  screen.getByRole("button")
).toBeInTheDocument();
```

## Example 5: Form Submission Test

```javascript
fireEvent.change(input, {
  target: {
    value: "Conference"
  }
});

fireEvent.click(submitButton);

expect(onSubmit).toHaveBeenCalled();
```

---

# 11. Pull Request Testing Requirements

Before opening a pull request:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] UI verification completed
- [ ] Accessibility reviewed
- [ ] Performance impact evaluated
- [ ] Documentation updated
- [ ] Manual testing completed

Contributors should summarize testing performed in the pull request description.

Example:

```text
Testing Completed

- Added unit tests for ticket validation
- Verified event creation workflow
- Tested mobile layout
- Confirmed accessibility labels
```

---

# 12. Conclusion

Testing is a shared responsibility.

Every contribution should provide confidence that:

- Existing functionality remains stable
- New functionality behaves correctly
- Accessibility standards are maintained
- Performance expectations are met
- Users receive a reliable experience

Following this playbook helps maintain software quality, reduce regressions, and improve the contributor experience across the project.