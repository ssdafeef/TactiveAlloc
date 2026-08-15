# AI Tooling and Change-Loop Evidence

## AI tools used
- GitHub Copilot: coding assistance, refactoring, test generation, and documentation support
- VS Code workspace tooling: local execution, pytest validation, and debugging

## Change-loop summary
This project follows the assessment's build → test → fix cycle:
1. Implement a feature request in code.
2. Run the backend test suite.
3. Inspect any failures.
4. Adjust the logic and re-run tests.
5. Repeat until the suite passes.

## Evidence captured in the repository
The repo includes the AI change-loop notes and test logs:
- [change_loop_log.md](../change_loop_log.md)
- [backend/test_results_red_run.log](../backend/test_results_red_run.log)
- [backend/test_results_shifts_run.log](../backend/test_results_shifts_run.log)
- [backend/test_results_shifts_attempt2.log](../backend/test_results_shifts_attempt2.log)
- [backend/test_results_shifts_attempt3.log](../backend/test_results_shifts_attempt3.log)

## Red-run evidence
The deliberate red-run log demonstrates the required failing test behavior, where the change loop intentionally introduced a breaking overlap-check and then validated that the test suite correctly caught it.

## Outcome
The final implementation is consistent with the requested shift-aware booking logic and passes the automated backend test suite.
