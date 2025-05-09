# Context7 Usage Guidelines

## Brief overview
These guidelines define how to effectively use the Context7 MCP tool for retrieving library documentation. Following these practices ensures efficient token usage and maintains a consistent approach to library documentation retrieval across the project.

## Token management
- Keep the output range between 2,000 to 10,000 tokens based on the complexity of the topic
- For simple concepts or quick references, use closer to 2,000 tokens
- For complex topics requiring detailed explanation, use up to 10,000 tokens
- Avoid exceeding 10,000 tokens to prevent excessive context window usage

## Library ID tracking
- Maintain a file named `library.md` to store all previously searched library IDs
- Before searching for a library, check this file first to see if the library ID is already available
- Only use `resolve-library-id` when the library hasn't been previously searched
- When adding a new library ID to the tracking file, include a brief description of what the library is used for

## Search optimization
- Use specific topics when retrieving documentation to get more relevant results
- When searching for migration guides or compatibility information, include version numbers in the topic
- For method-specific documentation, include the method name in the topic
- Prioritize official documentation over community examples when available

## Documentation usage
- After retrieving documentation, extract the most relevant information for the current task
- When implementing changes based on documentation, cite the specific part of the documentation that informed the change
- For complex migrations or upgrades, create a checklist based on the documentation to track progress

## Context7 workflow
- Add "use context7" to queries for automatically including current, accurate package documentation
- Start library searches with `resolve-library-id` to find the correct library ID
- Follow with `get-library-docs` to retrieve specific documentation
- Include topic parameter to focus on specific aspects of a library
- Document all library IDs in library.md after resolution with:
  - Library ID
  - Description
  - Purpose in the project
  - Date last searched
