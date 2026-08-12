# CI/CD Workflow Architecture

This document describes the Continuous Integration and Continuous Deployment (CI/CD) architecture of the Eventra project, powered by GitHub Actions.

## Overview Diagram

The following Mermaid diagram illustrates the end-to-end CI/CD process:

```mermaid
graph TD
    %% Triggers
    PullRequest([Pull Request]) --> ValidationTesting
    PullRequest --> SecurityCompliance
    PullRequest --> LintingQuality
    
    PushMain([Push to Main]) --> ValidationTesting
    PushMain --> SecurityCompliance
    PushMain --> LintingQuality
    PushMain --> DeploymentArtifacts
    
    Schedule([Scheduled Events]) --> Maint[Maintenance]

    %% Build & Test
    subgraph ValidationTesting ["Validation & Testing"]
        CI[CI Validation]
        CI_Matrix((Node.js Matrix))
        CI --> CI_Matrix
        CI_Matrix --> Build[Build App]
        CI_Matrix --> Test[Run Tests]
    end

    %% Security
    subgraph SecurityCompliance ["Security & Compliance"]
        SecurityScan[Security CI]
        CodeQL[CodeQL Analysis]
        Dependabot[Dependency Review]
        Gitleaks[Gitleaks Secret Scan]
        LicenseCheck[License Compliance]
    end

    %% Code Quality
    subgraph LintingQuality ["Linting & Quality"]
        MarkdownLint[Markdown Lint]
        Actionlint[Actionlint]
    end

    %% Deployment
    subgraph DeploymentArtifacts ["Deployment & Artifacts"]
        Build --> Upload[Upload Artifacts]
        DockerPublish[Publish Docker Image]
    end
    
    %% Maintenance
    subgraph Maint ["Maintenance"]
        ArtifactCleanup[Artifact Cleanup]
    end
```

## Workflows Explained

- **CI Validation (`ci.yml`)**: Compiles the source code, lints, and runs tests across a matrix of Node.js versions. Uses `.github/workflows/reusable-setup.yml` for execution.
- **Security Validation (`security-ci.yml`)**: Includes various security checks for the underlying Node.js environment.
- **CodeQL Analysis (`codeql.yml`)**: Runs GitHub's native static code analysis to discover deep vulnerabilities.
- **Gitleaks (`gitleaks.yml`)**: Secret scanning tool that prevents API keys or passwords from being merged.
- **License Compliance (`license-check.yml`)**: Prevents dependencies with overly restrictive copyleft licenses from being merged into the repository.
- **Dependency Review (`dependency-review.yml`)**: Assesses any pull request that changes package files for vulnerable dependencies.
- **Actionlint (`actionlint.yml`)**: Statically validates the `.yml` workflow files themselves.
- **Markdown Lint (`markdown-lint.yml`)**: Ensures consistent Markdown formatting across all documentation files.
- **Docker Publish (`docker-publish.yml`)**: Automatically builds and publishes Docker images to a registry upon merging into the default branch.
- **Artifact Cleanup (`artifact-cleanup.yml`)**: A scheduled job that deletes stale workflow artifacts to save GitHub Actions storage.
