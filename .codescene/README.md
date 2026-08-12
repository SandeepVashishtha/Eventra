# CodeScene Code Health Rules Configuration

This repository utilizes a custom CodeScene Code Health Rules configuration to define project-specific maintainability thresholds. The configuration is managed in `code-health-rules.json`.

## Why Custom Thresholds?

By default, CodeScene's complexity thresholds can generate a large volume of warnings on pull requests. In order to reduce review noise, improve the contributor experience, and surface genuinely important maintainability issues, we have established baseline thresholds that are tailored to the current state of our codebase.

## Configured Metrics

The following Code Health metrics have been overridden from their defaults to the suggested values below:

| Metric | Threshold |
| :--- | :--- |
| **Cyclomatic Complexity** | 20 |
| **Cognitive Complexity** | 25 |
| **Function Length** | 80 lines |
| **Nesting Depth** | 4 |
| **Parameter Count** | 5 |

## Exclusions

Test files and generated code (e.g., `**/*.test.js`, `**/*.spec.js`, `tests/**`) are intentionally excluded from strict complexity analysis. Their respective rule weights are set to `0.0`, which down-prioritizes these metrics entirely for those paths. This ensures that CodeScene focuses on the main application logic rather than mocking/testing setups.

## Modifying Thresholds

If you find that the codebase evolves to a point where these thresholds are too lenient (or still too strict), you can easily modify them. 
Open `.codescene/code-health-rules.json` and adjust the `threshold` value under the respective rule. Maintainers are encouraged to periodically review these thresholds to align with the project's evolving coding standards.
