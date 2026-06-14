# Storybook Developer Guide

This guide explains how to document, test, and catalog Eventra components using Storybook locally.

## How to Start

Launch the local Storybook dev instance:

```bash
npm run storybook
```

## Story Conventions

Create a `{ComponentName}.stories.jsx` file adjacent to your React component, declaring state permutations using Args.
