# MCP Tools Usage Guidelines

## Brief overview
These guidelines outline best practices for working with MCP (Model Context Protocol) servers in the project, with specific focus on Git MCP for version control and Context7 for documentation retrieval.

## Git MCP usage
- Use Git MCP for all version control operations rather than direct shell commands
- Commits should be atomic (focused on a single logical change)
- Commit messages must be concise to fit within de-facto length limits
- Follow the standard workflow: git_status → git_add → git_diff_staged → git_commit
- Always review changes with git_diff_staged before committing
- Create feature branches with git_create_branch for new development work

## Context7 MCP usage
- Add "use context7" to queries for retrieving up-to-date library documentation
- Start library searches with resolve-library-id to find the correct library ID
- Follow with get-library-docs to retrieve specific documentation
- Include topic parameter to focus on specific aspects of a library when needed
- Document all MCP tools in memory-bank files after installation

## Sequential thinking MCP usage
- Use the sequentialthinking tool for all complex problem-solving tasks
- Number thoughts incrementally and maintain a logical flow
- Use the isRevision parameter when revising earlier thoughts
- Ensure each thought builds upon previous ones
- Set nextThoughtNeeded to false only when reaching a definitive solution

## Memory bank updates
- Update memory-bank files after making significant changes to the project
- Document new tools, libraries, or development practices in activeContext.md
- Add technical implementation details to techContext.md
- Track completed features and working tools in progress.md
- Commit memory bank changes using the Git MCP workflow

## Code modifications
- Use Git MCP to track all code changes
- Test changes before committing
- Maintain consistent code style with existing project
- Document significant changes in comments and memory bank
