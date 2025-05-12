# Token Management Guidelines

## Brief Overview
These guidelines outline strategies to minimize input token usage during interactions with the AI assistant (Cline). Reducing token consumption can lead to cost savings and more efficient interactions.

## Core Principles
- **Conciseness**: Strive for brevity in all communications and tool inputs.
- **Necessity**: Ensure every piece of information sent and every action taken is essential for the task.
- **Precision**: Use targeted requests and inputs to avoid unnecessary data transfer.

## Strategies for Token Reduction

### 1. Communication with the Assistant
- **Concise Prompts**: Provide clear but brief instructions.
- **Focused Feedback**: When providing feedback, be specific and to the point.
- **Avoid Redundancy**: Don't repeat information the assistant already has from the current session (e.g., from previously read files).

### 2. Assistant's Output and Tool Usage (Guidelines for Cline)
- **Terse `thinking` Steps**: Internal thought processes should be summarized if complex, or kept brief.
- **Minimal Tool Inputs**:
    - `write_to_file`: Send only the final, necessary content.
    - `replace_in_file`: Send only the minimal diffs required for the change. Prefer `replace_in_file` over `write_to_file` for small modifications.
    - `search_files`: Use highly specific regex and file patterns to limit result size.
    - `execute_command`: Ensure commands are precise.
- **Strategic File Handling**:
    - Avoid re-reading files within the same session unless content has changed or is essential for a new context.
    - Utilize user-provided file content directly instead of using `read_file`.
- **Efficient MCP Tool Usage**:
    - Adhere to token limits for tools like `Context7` (e.g., `get-library-docs` `tokens` parameter).
    - Be mindful of the size and complexity of arguments passed to all MCP tools.

### 3. Managing `environment_details`
- The `environment_details` (especially the full file listing) can be a significant source of token usage.
- **User-Side Configuration**: Users may be able to configure their VS Code extension or environment to send a more summarized version of `environment_details` if full detail is not always required for the task. This is a user-controlled optimization.

### 4. Iterative Workflow
- Continue working step-by-step. Smaller, targeted exchanges for dependent tasks can be more token-efficient than large, complex requests that might require extensive corrections.

## Review and Adaptation
- These guidelines should be periodically reviewed and adapted as new tools or interaction patterns emerge.
- The assistant (Cline) should actively apply these strategies in all interactions.
