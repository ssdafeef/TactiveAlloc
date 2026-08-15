# Agents And AI Tools Used

The assessment asks to name every AI tool used and explain what it was used for.

## AI Tools

### GitHub Copilot

Used for:

- Coding assistance during development.
- Refactoring and readability improvements.
- Test generation and expansion of the pytest suite.
- Documentation support.

### VS Code Workspace Tooling

Used for:

- Local execution of the backend.
- Running pytest and capturing run output.
- Debugging failures during the change loop.

### AI Coding Agents During The Change Loop

Used for:

- Reading and understanding the existing codebase.
- Implementing the shift-based booking feature (models, schemas, API, scheduler).
- Adding shift-aware maintenance and transport-buffer logic.
- Adding new tests and running the suite.
- Documenting every change in `change_loop_log.md`.
- Capturing green run output at each attempt.

## Human Inputs

The project owner supplied:

- The assessment PDF.
- The product requirements and feature constraints.
- The instruction to add shift-based bookings.
- The requirement that the change loop must close: implement, test, fix, verify.

Secrets are not included in this documentation.

## Agentic Change Loop Summary

The implementation used an AI-assisted loop:

1. Inspect source and requirements.
2. Implement a targeted feature.
3. Run the test suite.
4. Diagnose failures.
5. Patch the source.
6. Re-run verification.
7. Document evidence.

Specific examples:

- Shift overlap logic was implemented and verified in attempt 1 (11 passed).
- Shift-aware maintenance and transport-buffer checks were added in attempt 2
  (15 passed).
- `full_day` handling against half-day maintenance was added in attempt 3
  (17 passed).
- A deliberate regression in the overlap check was introduced and caught by
  pytest, then restored and verified green.