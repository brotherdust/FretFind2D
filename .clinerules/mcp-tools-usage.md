# MCP Tools Usage Guidelines

## Brief overview
These guidelines outline best practices for working with MCP (Model Context Protocol) servers in the project, with specific focus on Git MCP for version control, Context7 for documentation retrieval, and Sequential Thinking for structured problem-solving. All MCP tool usage should also be mindful of token efficiency, as detailed in `.clinerules/token-management.md`.

## Git MCP usage
- Use Git MCP for all version control operations rather than direct shell commands
- Commits should be atomic (focused on a single logical change)
- Commit messages must be concise to fit within de-facto length limits (50 characters)
- Follow the standard workflow: git_status → git_add → git_diff_staged → git_commit
- Always review changes with git_diff_staged before committing
- Create feature branches with git_create_branch for new development work
- Use git_log to review commit history before making related changes
- Include issue references in commit messages when applicable using (#123) format

## Context7 MCP usage
- Add "use context7" to queries for retrieving up-to-date library documentation
- Start library searches with resolve-library-id to find the correct library ID
- Follow with get-library-docs to retrieve specific documentation
- Include topic parameter to focus on specific aspects of a library when needed
- Document all library IDs in library.md after resolution
- Keep token usage between 2,000-10,000 based on topic complexity
- Check library.md before using resolve-library-id to avoid duplicate searches
- Include version numbers in topic when searching for migration guides
- Include method names in topic when searching for specific method documentation

## Sequential thinking MCP usage
- Use the sequentialthinking tool for ALL complex problem-solving tasks
- Number thoughts incrementally and maintain a logical flow
- Use the isRevision parameter when revising earlier thoughts
- Use branchFromThought and branchId when exploring alternative approaches
- Ensure each thought builds upon previous ones
- Set nextThoughtNeeded to false only when reaching a definitive solution
- Start with a reasonable estimate of totalThoughts (5-10), adjusting as needed
- Document key insights from the thinking process in code comments
- Use for all architecture and design planning stages
- Use for evaluating tradeoffs between different technical approaches
- Use for debugging complex issues
- Use for feature prioritization decisions

## Memory bank updates
- Update memory-bank files after making significant changes to the project
- Document new tools, libraries, or development practices in activeContext.md
- Add technical implementation details to techContext.md
- Track completed features and working tools in progress.md
- Commit memory bank changes using the Git MCP workflow
- When triggered by "update memory bank", review ALL memory bank files
- Focus particularly on activeContext.md and progress.md as they track current state
- Document all MCP tools in memory-bank files after installation

## Code modifications
- Use Git MCP to track all code changes
- Test changes before committing
- Maintain consistent code style with existing project
- Document significant changes in comments and memory bank
- When updating multiple files for a single feature, commit them together
- Prioritize compatibility over using the latest library versions
- Document library version changes in commit messages
