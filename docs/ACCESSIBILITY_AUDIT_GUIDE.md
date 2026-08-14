# Accessibility Audit Guide

A practical guide for contributors auditing accessibility in Eventra. Use this guide to identify accessibility barriers, verify fixes, and document audit results.

## Table of Contents

- [Purpose](#purpose)
- [WCAG Principles](#wcag-principles)
- [Keyboard Navigation Checks](#keyboard-navigation-checks)
- [Screen Reader Testing](#screen-reader-testing)
- [Color Contrast Requirements](#color-contrast-requirements)
- [Form Accessibility Validation](#form-accessibility-validation)
- [Mobile Accessibility Standards](#mobile-accessibility-standards)
- [Audit Workflow](#audit-workflow)
- [Audit Reporting Template](#audit-reporting-template)
- [Issue Severity](#issue-severity)
- [Final Audit Checklist](#final-audit-checklist)

---

## Purpose

Accessibility auditing helps ensure that Eventra can be used by people with different abilities, input methods, devices, and assistive technologies.

Contributors should consider accessibility during:

- Feature development
- UI changes
- Component refactoring
- Bug fixes
- Design changes
- Form development
- Navigation changes
- Responsive layout changes

Accessibility should be checked before submitting a pull request whenever a change affects the user interface.

---

## WCAG Principles

The Web Content Accessibility Guidelines are organized around four fundamental principles.

A user interface should be:

1. **Perceivable**
2. **Operable**
3. **Understandable**
4. **Robust**

These principles provide a foundation for accessibility testing.

### Perceivable

Information and user interface components should be presented in ways users can perceive.

Check:

- [ ] Images have appropriate alternative text.
- [ ] Decorative images are correctly identified.
- [ ] Important information is not communicated through color alone.
- [ ] Videos provide appropriate alternatives where required.
- [ ] Audio content has appropriate alternatives.
- [ ] Text can be resized without losing important information.
- [ ] Content remains readable at increased zoom levels.
- [ ] Headings are structured logically.
- [ ] Content has sufficient contrast.
- [ ] Important controls have visible labels.

### Operable

Users should be able to operate the interface using different input methods.

Check:

- [ ] Interactive elements can be reached with the keyboard.
- [ ] Keyboard focus is visible.
- [ ] Focus order is logical.
- [ ] No interaction requires a mouse exclusively.
- [ ] Modal dialogs can be operated using the keyboard.
- [ ] Menus can be opened and closed with the keyboard.
- [ ] Dropdown controls are keyboard accessible.
- [ ] Interactive controls have reasonable target sizes.
- [ ] Users are not trapped inside components.
- [ ] Time-sensitive interactions provide appropriate controls.

### Understandable

Users should be able to understand the content and interface.

Check:

- [ ] Navigation is consistent.
- [ ] Buttons have understandable labels.
- [ ] Form fields have clear instructions.
- [ ] Error messages are understandable.
- [ ] Validation messages identify the affected field.
- [ ] Important changes are communicated appropriately.
- [ ] Page titles describe the current page.
- [ ] Language is clear and consistent.
- [ ] Unexpected context changes are avoided.

### Robust

Content should work with browsers and assistive technologies.

Check:

- [ ] Semantic HTML is used where appropriate.
- [ ] ARIA is used only when necessary.
- [ ] Interactive elements expose their accessible names.
- [ ] Custom components expose appropriate roles.
- [ ] Dynamic content can be detected by assistive technologies.
- [ ] Invalid HTML patterns are avoided.
- [ ] Component state is exposed appropriately.
- [ ] Accessibility behavior remains stable across supported browsers.

---

# Keyboard Navigation Checks

Keyboard testing is one of the most important accessibility checks.

A contributor should be able to complete common workflows without using a mouse.

## Basic Keyboard Test

Use the following keys:

- `Tab`
- `Shift + Tab`
- `Enter`
- `Space`
- `Arrow Keys`
- `Escape`

Check:

- [ ] Start from the top of the page.
- [ ] Press `Tab` repeatedly.
- [ ] Verify that focus moves logically.
- [ ] Verify that every interactive element can receive focus.
- [ ] Verify that focus is visible.
- [ ] Use `Shift + Tab` to move backward.
- [ ] Use `Enter` on links and buttons where appropriate.
- [ ] Use `Space` on appropriate controls.
- [ ] Use `Escape` to close dismissible dialogs.
- [ ] Verify menus are keyboard accessible.
- [ ] Verify dropdowns are keyboard accessible.
- [ ] Verify dialogs are keyboard accessible.

## Focus Visibility

Every keyboard-focusable element should have a visible focus indicator.

Check:

- [ ] Focus is clearly visible.
- [ ] Focus is not hidden behind other content.
- [ ] Focus does not disappear when a component receives focus.
- [ ] Focus indicators have sufficient visual distinction.
- [ ] Custom focus styles remain visible in different themes.

Avoid removing browser focus styles without providing an accessible replacement.

## Focus Order

The focus order should normally follow the visual and logical order of the page.

Check:

- [ ] Header navigation follows a logical order.
- [ ] Main content follows navigation.
- [ ] Forms follow their visual order.
- [ ] Dialog controls follow a logical sequence.
- [ ] Footer controls are reachable after main content.
- [ ] Hidden elements are not unexpectedly focusable.

## Keyboard Traps

A keyboard trap occurs when a user can enter a component but cannot leave it using normal keyboard interaction.

Check:

- [ ] Dialogs can be exited.
- [ ] Menus can be closed.
- [ ] Sidebars can be closed.
- [ ] Custom widgets can be exited.
- [ ] Focus does not become permanently trapped.
- [ ] Escape behavior is available where appropriate.

---

# Screen Reader Testing

Screen reader testing helps verify that content and interactions are exposed correctly to assistive technologies.

Common screen readers include:

- NVDA
- JAWS
- VoiceOver
- TalkBack

Use at least one appropriate screen reader during an accessibility audit.

## Page Structure

Check:

- [ ] The page has a meaningful title.
- [ ] Headings are announced correctly.
- [ ] Heading levels are logical.
- [ ] Navigation landmarks are available.
- [ ] Main content is identifiable.
- [ ] Complementary content is identifiable where appropriate.
- [ ] Footer content is identifiable.
- [ ] Lists are announced as lists.
- [ ] Tables expose their structure correctly.

## Images

Check:

- [ ] Informative images have useful alternative text.
- [ ] Decorative images are ignored by screen readers.
- [ ] Icons with actions have accessible names.
- [ ] Complex graphics have appropriate descriptions.
- [ ] Image buttons have meaningful accessible names.

Avoid alternative text such as:

- "image"
- "picture"
- "photo"

unless that wording is actually meaningful.

## Links

Check:

- [ ] Links have meaningful names.
- [ ] Links make sense when read independently.
- [ ] Links do not rely only on surrounding visual context.
- [ ] External links are understandable.
- [ ] Download links identify the resource where appropriate.

Avoid repeated generic link labels such as:

- "Click here"
- "Read more"
- "Learn more"

when their destination cannot be understood from the accessible name.

## Buttons

Check:

- [ ] Every button has an accessible name.
- [ ] Icon-only buttons have accessible labels.
- [ ] Button state is exposed.
- [ ] Expandable buttons communicate expanded state.
- [ ] Toggle buttons communicate their current state.
- [ ] Disabled controls are exposed appropriately.

## Dynamic Content

Check:

- [ ] Important status changes are announced.
- [ ] Form validation changes are communicated.
- [ ] Loading states are understandable.
- [ ] Success messages are announced where necessary.
- [ ] Error messages are announced where necessary.
- [ ] Live regions are used appropriately.

Avoid excessive announcements that make the interface difficult to navigate.

---

# Color Contrast Requirements

Color should provide sufficient contrast between foreground and background content.

For WCAG-based auditing, check:

- Normal text
- Large text
- Buttons
- Links
- Form controls
- Icons
- Borders when they communicate component boundaries
- Focus indicators
- Status indicators

## Contrast Checks

Check:

- [ ] Normal text has sufficient contrast.
- [ ] Large text has sufficient contrast.
- [ ] Important icons have sufficient contrast.
- [ ] Interactive controls have sufficient contrast.
- [ ] Focus indicators remain visible.
- [ ] Error messages are not communicated by color alone.
- [ ] Success messages are not communicated by color alone.
- [ ] Warning states are not communicated by color alone.
- [ ] Disabled-state presentation does not make required information inaccessible.

## Color Independence

Do not rely only on color to communicate meaning.

For example, avoid:

- Red text alone to identify an error.
- Green text alone to identify success.
- Different colors alone to identify event categories.
- Color alone to identify required fields.

Use additional indicators such as:

- Text
- Icons
- Labels
- Patterns
- Borders
- Accessible descriptions

## Contrast Testing Tools

Contributors may use accessibility auditing tools and browser extensions to inspect contrast.

For every reported contrast problem:

- [ ] Identify the affected element.
- [ ] Record foreground color.
- [ ] Record background color.
- [ ] Record the measured contrast.
- [ ] Identify the expected requirement.
- [ ] Document the proposed fix.

---

# Form Accessibility Validation

Forms are a major accessibility consideration in Eventra because users may register for events, submit information, and manage event details.

## Form Labels

Check:

- [ ] Every form control has a label.
- [ ] Labels clearly describe their controls.
- [ ] Labels are programmatically associated with inputs.
- [ ] Placeholder text is not used as the only label.
- [ ] Required fields are clearly identified.

## Input Types

Use appropriate input types.

Check:

- [ ] Email fields use appropriate input types.
- [ ] Telephone fields use appropriate input types.
- [ ] Date fields are understandable.
- [ ] Numeric fields expose appropriate semantics.
- [ ] Search fields are identifiable.
- [ ] Password fields are correctly labeled.

## Required Fields

Check:

- [ ] Required fields are identified.
- [ ] Required status is available to assistive technologies.
- [ ] Required fields are explained before submission where appropriate.
- [ ] Users can understand which fields must be completed.

## Error Handling

When a form contains errors:

- [ ] Errors are clearly identified.
- [ ] Error messages explain the problem.
- [ ] Error messages explain how to fix the problem where possible.
- [ ] The affected field is identifiable.
- [ ] Error information is available to screen readers.
- [ ] Focus can be moved to the relevant error when appropriate.
- [ ] Previously entered information is preserved where possible.

## Form Instructions

Check:

- [ ] Instructions appear before users need them.
- [ ] Complex fields include useful guidance.
- [ ] Formatting requirements are explained.
- [ ] Character limits are communicated.
- [ ] Required information is clearly identified.
- [ ] Validation rules are understandable.

## Form Testing

Test:

- [ ] Keyboard-only submission.
- [ ] Screen reader navigation.
- [ ] Empty submission.
- [ ] Invalid input.
- [ ] Correct input.
- [ ] Required fields.
- [ ] Long text.
- [ ] Unexpected characters.
- [ ] Mobile input.
- [ ] Error recovery.

---

# Mobile Accessibility Standards

Accessibility should also be tested on mobile devices and small screens.

## Responsive Layout

Check:

- [ ] Content remains readable on small screens.
- [ ] Text does not overlap.
- [ ] Controls remain usable.
- [ ] Navigation remains understandable.
- [ ] Dialogs fit within the viewport.
- [ ] Forms remain usable.
- [ ] Horizontal scrolling is avoided where possible.
- [ ] Important content is not hidden.
- [ ] Orientation changes do not break the interface.

## Touch Interaction

Check:

- [ ] Interactive targets are sufficiently large.
- [ ] Controls have adequate spacing.
- [ ] Adjacent controls are not difficult to distinguish.
- [ ] Gestures are not the only way to perform important actions.
- [ ] Alternative controls exist for complex gestures.
- [ ] Users can operate controls without precise pointing.

## Mobile Screen Readers

Test with:

- VoiceOver on iOS
- TalkBack on Android

Check:

- [ ] Page structure is understandable.
- [ ] Buttons have accessible names.
- [ ] Form controls are labeled.
- [ ] Dialogs are understandable.
- [ ] Navigation is usable.
- [ ] Dynamic content is announced appropriately.
- [ ] Errors are communicated.
- [ ] Important status changes are detectable.

## Zoom and Text Scaling

Check:

- [ ] Text can be enlarged.
- [ ] Layout remains usable when text is enlarged.
- [ ] Important controls remain visible.
- [ ] Content does not become inaccessible.
- [ ] Buttons remain usable.
- [ ] Form controls remain usable.

---

# Audit Workflow

Use the following process when performing an accessibility audit.

## Step 1: Identify the Scope

- [ ] Identify the page or feature.
- [ ] Identify affected components.
- [ ] Identify expected user workflows.
- [ ] Identify supported devices.
- [ ] Identify supported browsers.
- [ ] Identify relevant assistive technologies.

## Step 2: Automated Checks

Run available automated accessibility tools.

Check for:

- [ ] Missing labels.
- [ ] Missing alternative text.
- [ ] Invalid ARIA.
- [ ] Contrast problems.
- [ ] Heading problems.
- [ ] Duplicate IDs.
- [ ] Invalid form associations.
- [ ] Other reported accessibility issues.

Automated tools should support, not replace, manual testing.

## Step 3: Keyboard Audit

- [ ] Navigate the complete workflow using only a keyboard.
- [ ] Verify focus order.
- [ ] Verify focus visibility.
- [ ] Verify interactive controls.
- [ ] Verify dialogs.
- [ ] Verify menus.
- [ ] Verify forms.

## Step 4: Screen Reader Audit

- [ ] Navigate page landmarks.
- [ ] Navigate headings.
- [ ] Test links.
- [ ] Test buttons.
- [ ] Test forms.
- [ ] Test dynamic updates.
- [ ] Test errors.
- [ ] Test dialogs.

## Step 5: Visual Audit

Check:

- [ ] Contrast.
- [ ] Typography.
- [ ] Focus indicators.
- [ ] Error indicators.
- [ ] Status indicators.
- [ ] Responsive layout.
- [ ] Zoom behavior.

## Step 6: Mobile Audit

- [ ] Test small screen layouts.
- [ ] Test touch controls.
- [ ] Test mobile navigation.
- [ ] Test mobile forms.
- [ ] Test screen reader behavior.

## Step 7: Document Findings

For each issue:

- [ ] Record the affected page.
- [ ] Record the affected component.
- [ ] Describe the accessibility problem.
- [ ] Explain how to reproduce it.
- [ ] Record the expected behavior.
- [ ] Record the actual behavior.
- [ ] Assign severity.
- [ ] Recommend a fix.
- [ ] Record testing performed.

---

# Audit Reporting Template

Use this template when reporting an accessibility audit.

## Accessibility Audit Report

**Feature:** {{feature_name}}

**Page:** {{page_url}}

**Auditor:** {{auditor_name}}

**Date:** {{audit_date}}

**Application Version:** {{version}}

**Browser:** {{browser}}

**Operating System:** {{operating_system}}

**Assistive Technology:** {{assistive_technology}}

### Scope

Describe the pages, workflows, and components included in the audit.

### Testing Methods

- [ ] Automated accessibility testing
- [ ] Keyboard testing
- [ ] Screen reader testing
- [ ] Visual inspection
- [ ] Color contrast testing
- [ ] Form testing
- [ ] Mobile testing
- [ ] Zoom testing

### Findings

#### Finding 1

**Title:** {{finding_title}}

**Severity:** {{severity}}

**Location:** {{page_or_component}}

**Description:**

{{description}}

**Steps to Reproduce:**

1. {{step_one}}
2. {{step_two}}
3. {{step_three}}

**Expected Result:**

{{expected_result}}

**Actual Result:**

{{actual_result}}

**Recommended Fix:**

{{recommended_fix}}

**Testing Evidence:**

{{testing_evidence}}

---

# Issue Severity

Use consistent severity when documenting accessibility findings.

## Critical

Use for problems that prevent users from completing essential workflows.

Examples:

- Users cannot submit an essential form using a keyboard.
- A critical workflow is completely inaccessible to screen readers.
- Users cannot access essential navigation.

## High

Use for significant barriers that affect important functionality.

Examples:

- Major form fields have no accessible labels.
- Important controls cannot receive keyboard focus.
- Critical information is inaccessible to assistive technology.

## Medium

Use for barriers that make functionality difficult but do not completely prevent completion.

Examples:

- Poor focus visibility.
- Confusing error messaging.
- Inconsistent heading structure.

## Low

Use for minor issues that have limited impact.

Examples:

- Minor labeling improvements.
- Small consistency problems.
- Non-critical documentation gaps.

---

# Audit Checklist

## Page Structure

- [ ] Page title is meaningful.
- [ ] Heading hierarchy is logical.
- [ ] Main landmark is present.
- [ ] Navigation is identifiable.
- [ ] Content structure is understandable.

## Keyboard

- [ ] All interactive elements are keyboard accessible.
- [ ] Focus is visible.
- [ ] Focus order is logical.
- [ ] No keyboard traps exist.
- [ ] Dialogs are keyboard accessible.
- [ ] Menus are keyboard accessible.

## Screen Reader

- [ ] Images have appropriate alternatives.
- [ ] Buttons have accessible names.
- [ ] Links have meaningful names.
- [ ] Forms have labels.
- [ ] Dynamic content is announced appropriately.
- [ ] Errors are communicated.

## Visual

- [ ] Text contrast is sufficient.
- [ ] Important controls have sufficient contrast.
- [ ] Focus indicators are visible.
- [ ] Information is not communicated through color alone.
- [ ] Content remains usable when zoomed.

## Forms

- [ ] Labels are associated with controls.
- [ ] Required fields are identified.
- [ ] Instructions are understandable.
- [ ] Errors are clearly communicated.
- [ ] Error recovery is possible.
- [ ] Forms work using the keyboard.

## Mobile

- [ ] Content works on small screens.
- [ ] Controls are touch accessible.
- [ ] Navigation works on mobile.
- [ ] Forms work on mobile.
- [ ] Text scaling does not break the interface.
- [ ] Mobile screen readers can navigate the interface.

## Reporting

- [ ] Audit scope is documented.
- [ ] Testing environment is documented.
- [ ] Findings are documented.
- [ ] Severity is assigned.
- [ ] Reproduction steps are included.
- [ ] Expected behavior is documented.
- [ ] Recommended fixes are documented.
- [ ] Retesting is performed after fixes.

---

# Final Audit Checklist

Before marking an accessibility audit complete:

- [ ] WCAG principles were considered.
- [ ] Keyboard navigation was tested.
- [ ] Focus visibility was checked.
- [ ] Focus order was checked.
- [ ] Keyboard traps were checked.
- [ ] Screen reader testing was performed.
- [ ] Images were reviewed.
- [ ] Links were reviewed.
- [ ] Buttons were reviewed.
- [ ] Dynamic content was reviewed.
- [ ] Color contrast was tested.
- [ ] Color-independent indicators were reviewed.
- [ ] Forms were tested.
- [ ] Error handling was tested.
- [ ] Mobile layouts were tested.
- [ ] Touch interactions were tested.
- [ ] Text scaling was tested.
- [ ] Findings were documented.
- [ ] Severity was assigned.
- [ ] Recommended fixes were recorded.
- [ ] Fixes were retested.
- [ ] Final results were shared with the appropriate contributors.

---

## Accessibility Audit Sign-Off

**Audit Status:** {{pass_or_needs_changes}}

**Auditor:** {{auditor_name}}

**Date:** {{audit_date}}

**Reviewed By:** {{reviewer_name}}

**Outstanding Issues:** {{outstanding_issue_count}}

**Notes:**

{{final_notes}}