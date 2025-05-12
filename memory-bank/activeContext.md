# Active Context: FretFind2D

## Current Work Focus

The FretFind2D project is an established browser-based tool for designing fretboards for stringed instruments, particularly focusing on microtonal and multi-scale designs. The application provides a comprehensive set of features for instrument designers, luthiers, and musicians experimenting with alternative tuning systems.

### Current Development Stage
- The application is fully functional with a complete feature set
- The codebase is stable and mature
- The project has an established user base via its online presence
- Development appears to be in a maintenance phase

## Recent Changes

Based on the repository observation, the project has:
- Been made available as a GitHub Pages deployment for online usage
- Received Docker configuration for easier local development
- Maintained backward compatibility with existing designs
- **jQuery and related plugins (Migrate, BBQ, browser-fix) were removed and code refactored to use vanilla JavaScript (May 2025).**

## Active Decisions and Considerations

### Technical Direction
- Maintaining the pure client-side approach with no server dependencies
- Ensuring cross-browser compatibility while supporting modern APIs (DOM manipulation and event handling now use vanilla JavaScript).
- Preserving URL parameter-based design sharing (URL parsing refactored to vanilla JavaScript).
- Supporting various export formats to meet different user needs

### User Experience Focus
- Maintaining the balance between powerful features and usability
- Preserving the helpful documentation embedded in the interface
- Ensuring the visualization accurately represents the physical fretboard
- Supporting a wide range of use cases from traditional to experimental designs

### Architectural Decisions
- Continuing with the modular approach for maintainability
- Preserving the mathematical model that enables complex fretboard designs
- Maintaining the separation between core calculation logic and UI

### Operational Efficiency
- **Token Usage Optimization**: Actively employing strategies to minimize input token usage during AI-assisted development. This includes concise communication, strategic tool use, and efficient file handling, as detailed in `.clinerules/token-management.md`.

## Next Steps

Potential next steps for the project could include:

### Potential Enhancements
- Modernizing the UI for a more contemporary look and feel
- Reviewing and updating remaining third-party libraries to newer versions (jQuery removed).
- Improving mobile responsiveness for better access on tablets/phones
- Adding more export formats or improving existing ones
- Enhancing visualization with more realistic rendering options

### Maintenance Tasks
- Reviewing and updating documentation
- Testing browser compatibility with newest browser versions
- Optimizing performance for complex fretboard designs
- Addressing any reported issues or bugs

### Exploration Areas
- Supporting additional tuning systems or scale formats
- Expanding visualization options (3D view, perspective view)
- Adding simulation features (e.g., sound preview based on design)
- Creating predefined templates for common instrument types

## Development Tools

### MCP Servers
The project has integrated MCP (Model Context Protocol) servers to extend functionality:

#### Git MCP Server
- Server name: `github.com/modelcontextprotocol/servers/tree/main/src/git`
- Integration method: Directly using `uvx` to run the server
- Configuration location: `/Users/jarad/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Key Git tools available through the MCP server:
- `git_status`: Shows working tree status
- `git_add`: Stages files for commit
- `git_commit`: Records changes to the repository
- `git_diff_unstaged`: Shows changes not yet staged
- `git_diff_staged`: Shows changes staged for commit
- `git_diff`: Shows differences between commits
- `git_log`: Views commit history
- `git_reset`: Unstages all staged changes
- `git_create_branch`: Creates a new branch
- `git_checkout`: Switches branches
- `git_show`: Shows contents of a commit

#### Context7 MCP Server
- Server name: `github.com/upstash/context7-mcp`
- Integration method: Using `npx` with the `@upstash/context7-mcp@latest` package
- Storage location: `/Users/jarad/Documents/Cline/MCP/context7-mcp`
- Configuration location: `/Users/jarad/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Key Context7 tools available:
- `resolve-library-id`: Finds Context7-compatible library IDs for packages
- `get-library-docs`: Retrieves up-to-date documentation for a specific library

Using Context7 in prompts:
- Add "use context7" to queries for automatically including current, accurate package documentation
- Example: "Create a React component with useState. use context7"

#### Sequential Thinking MCP Server
- Server name: `github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking`
- Integration method: Using `npx` with the `@modelcontextprotocol/server-sequential-thinking` package
- Storage location: `/Users/jarad/Documents/Cline/MCP/sequential-thinking`
- Configuration location: `/Users/jarad/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

Key Sequential Thinking tool available:
- `sequentialthinking`: Facilitates structured problem-solving through sequential, revisable thoughts

This tool is particularly useful for:
- Breaking down complex problems into manageable steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope isn't clear initially
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

#### Best Practices for Sequential Thinking Tool Usage
The Sequential Thinking tool should be used frequently for complex problems. It offers significant advantages over standard approaches:

1. **When to Use Sequential Thinking (Often!)**
   - For all architecture and design planning stages
   - When evaluating tradeoffs between different technical approaches
   - During debugging of complex issues
   - For feature prioritization decisions
   - Any time a problem has multiple interdependent parts
   - When initial assumptions might need revision as understanding evolves

2. **Sequential Thinking Process**
   - Start with an initial framing of the problem (thought #1)
   - Break down key components and considerations (thought #2-3)
   - Evaluate approaches and identify constraints (thought #4-5)
   - Revise previous thoughts when new insights emerge (using isRevision parameter)
   - Branch into alternative solutions when appropriate (using branchId)
   - Conclude with a synthesized solution (final thought)

3. **Practical Usage Tips**
   - Begin with a reasonable estimate of total thoughts (5-10), adjusting as needed
   - Don't hesitate to revise earlier thoughts as understanding develops
   - Use the branching capability to explore alternative approaches
   - Set nextThoughtNeeded to false only when a satisfactory conclusion is reached
   - Structure complex thoughts into clear sections for better readability
   - Document key insights from the thinking process in code comments

### Best Practices for MCP Server Usage

#### Git MCP Server Usage
- After any significant code changes, use git_add and git_commit to maintain version history
- Always check file status with git_status before committing
- Use git_diff to review changes before committing
- Create feature branches with git_create_branch for new development work
- Include issue references in commit messages when applicable using (#123) format
- Keep commit message subjects concise (50 characters maximum)
- Example workflow:
  1. `git_status` to check current state
  2. `git_add` to stage changes
  3. `git_diff_staged` to review staged changes
  4. `git_commit` to commit changes with descriptive message

#### Context7 Usage
- Use for up-to-date documentation on libraries and frameworks
- Start library searches with `resolve-library-id` to find the correct library ID
- Follow with `get-library-docs` to retrieve specific documentation
- Include topic parameter to focus on specific aspects of a library
- Document all library IDs in library.md after resolution with:
  - Library ID
  - Description
  - Purpose in the project
  - Date last searched
- Keep token usage between 2,000-10,000 based on topic complexity
- Check library.md before using resolve-library-id to avoid duplicate searches

## Project Insights

### Key Strengths
- Unique capability to model complex fretboard geometries
- Comprehensive support for microtonal scales
- Multiple output formats for practical instrument building
- Client-side processing enabling offline use
- Shareable designs via URL parameters

### Known Challenges
- Complex UI with many parameters that may overwhelm beginners
- Codebase refactored from jQuery to vanilla JavaScript; thorough manual testing of all UI interactions (especially radio buttons and text input behavior) is pending.
- Limited visual guidance for novice luthiers on practical implementation
- Some experimental features (like individual string scaling) still marked as experimental

### Technical Learnings
- Effective modeling of complex 2D geometry in browser
- Successful implementation of client-side file generation
- Practical application of musical theory in software
- Balance between powerful features and user-friendly interface
- Successful refactoring of jQuery-dependent DOM manipulation, event handling, and URL parameter processing to vanilla JavaScript.
