# Development Workflow Guidelines

## Brief overview
These guidelines define the preferred development workflow for this project, focusing on sequential thinking approaches, version control practices, and overall operational efficiency. This includes being mindful of AI interaction costs by following token management strategies outlined in `.clinerules/token-management.md`. Following these practices ensures consistent, well-documented, and methodical development.

## Sequential thinking approach
- ALWAYS use the sequentialthinking MCP tool when solving complex problems
- Break down problems into logical steps before implementing solutions
- Document your thinking process for each significant decision
- Use the sequentialthinking tool to explore alternative approaches when facing challenges
- Revisit and refine previous thoughts as new information becomes available
- Use the isRevision parameter when revising earlier thoughts
- Use branchFromThought and branchId when exploring alternative approaches
- Start with a reasonable estimate of totalThoughts (5-10), adjusting as needed
- Document key insights from the thinking process in code comments

## Version control practices
- ALWAYS use the git MCP tools for all version control operations
- Commit changes EVERY time a meaningful change is made to the codebase
- Avoid direct shell commands for git operations - use the git MCP tools exclusively
- Make atomic commits (focused on a single logical change)
- Write clear, descriptive commit messages that explain the purpose of the change
- Follow a conventional format for commit messages (Fix:, Feature:, Refactor:, etc.)
- Keep commit message subjects concise (50 characters maximum)
- Review changes with git_diff_staged before committing
- Use git_log to review commit history before making related changes
- Include issue references in commit messages when applicable using (#123) format

## Library management 
- Prioritize compatibility over using the latest library versions
- Test thoroughly when updating dependencies
- Document library version changes in commit messages
- When reverting to older library versions for compatibility, explain the reasoning
- Use Context7 MCP tools to retrieve up-to-date library documentation
- Document all library IDs in library.md after resolution
- Check library.md before using resolve-library-id to avoid duplicate searches

## Code modifications
- Test changes before committing them
- Maintain consistent code style with the existing project
- Document significant changes in comments
- When updating multiple files for a single feature, commit them together
- Update memory-bank files after making significant changes to the project
- Document new tools, libraries, or development practices in activeContext.md
- Add technical implementation details to techContext.md
- Track completed features and working tools in progress.md
