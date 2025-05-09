# Development Workflow Guidelines

## Brief overview
These guidelines define the preferred development workflow for this project, focusing on sequential thinking approaches and version control practices. Following these practices ensures consistent, well-documented, and methodical development.

## Sequential thinking approach
- ALWAYS use the sequentialthinking MCP tool when solving complex problems
- Break down problems into logical steps before implementing solutions
- Document your thinking process for each significant decision
- Use the sequentialthinking tool to explore alternative approaches when facing challenges
- Revisit and refine previous thoughts as new information becomes available

## Version control practices
- ALWAYS use the git MCP tools for all version control operations
- Commit changes EVERY time a meaningful change is made to the codebase
- Avoid direct shell commands for git operations - use the git MCP tools exclusively
- Make atomic commits (focused on a single logical change)
- Write clear, descriptive commit messages that explain the purpose of the change
- Follow a conventional format for commit messages (Fix:, Feature:, Refactor:, etc.)
- Review changes with git_diff_staged before committing

## Library management 
- Prioritize compatibility over using the latest library versions
- Test thoroughly when updating dependencies
- Document library version changes in commit messages
- When reverting to older library versions for compatibility, explain the reasoning

## Code modifications
- Test changes before committing them
- Maintain consistent code style with the existing project
- Document significant changes in comments
- When updating multiple files for a single feature, commit them together
