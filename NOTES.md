# Week 1 Assessment: Starter App Exploration

## Application Overview

The Task Tracker is a React application for managing tasks. Users can create, edit, delete, filter and mark tasks as completed. It uses React Hooks for state management and the Fetch API to communicate with the backend.

## 1. Areas I Would Improve

1. **Error Handling:** Add proper error handling to API requests so users receive feedback when an operation fails.
2. **Loading States:** Show loading indicators while tasks are being fetched.
3. **Form Validation:** Prevent users from submitting empty task titles.
4. **Editing:** Allow users to update task priorities and due dates, not just titles.

## 2. AI Tools and Prompts Used

**Tool:** ChatGPT

**Prompts:**
- Explain this React component step by step, including what it does, how it works and potential issues.
- Act as a Senior Software Engineer and mentor. Explain the code, how its parts interact, and highlight areas for improvement.

## 3. What AI Got Wrong or Missed

AI initially highlighted the Save button's missing `type="button"` as a potential issue. However, checking the JSX showed that the task table is outside the task creation form, so it does not currently cause an unintended form submission.

## 4. Key Learnings

- Better understanding of React Hooks and controlled components.
- How frontend applications communicate with backend APIs.
- The importance of validating AI explanations against the actual code.