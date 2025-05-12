# Progress Tracking Guidelines

## Brief overview
These guidelines define how to track and document progress in the FretFind2D project, specifically focusing on maintaining the memory-bank/progress.md file. Following these practices ensures that project status is accurately reflected and progress is properly documented through consistent updates and commits.

## Progress identification
- Update the progress.md file whenever a task is completed that matches an objective listed in the "What's Left to Build" section
- Update the progress.md file when resolving items listed in the "Known Issues" section
- Consider a task "complete" when it is fully implemented, tested, and ready for use
- Move completed items from "What's Left to Build" to the appropriate "What Works" section
- Remove resolved issues from the "Known Issues" section with documentation of the resolution
- Add a ✅ checkmark to newly completed items to maintain consistency with existing format
- Update the "Current Status" section to reflect significant milestones or changes in project status

## Update frequency
- Update progress.md immediately after completing any task listed in the file
- Update progress.md immediately after resolving any known issue listed in the file
- Review progress.md before completing any major development session
- Perform a comprehensive review of progress.md at the completion of any sprint or development cycle
- Update technical details in the "Evolution of Project Decisions" section when architectural or technical choices change

## Documentation format
- Maintain the existing structure and formatting of the progress.md file
- Use consistent emoji checkmarks (✅) for completed items
- Use consistent checkbox format (- [ ]) for incomplete items
- Keep descriptions concise but informative
- Include the date of completion for major features in parentheses when appropriate
- Organize completed items logically within their respective categories

## Commit practices
- Commit progress.md updates separately from code changes for clarity
- Use the commit message format: "Update progress: [brief description of progress]"
- Include references to related code commits when applicable
- Ensure progress.md is committed after each update to maintain an accurate record
- Include details about what was completed or resolved in the commit message body

## Known issues management
- When resolving a known issue, remove it from the "Known Issues" section
- Document how the issue was resolved in the commit message
- If a new issue is discovered, add it to the "Known Issues" section with appropriate details
- Prioritize issues in the list based on their impact on functionality
- When partially resolving an issue, update its description to reflect the current state

## Next priorities maintenance
- Reorder the "Next Development Priorities" section as priorities shift
- Remove completed priorities and add new ones as the project evolves
- Keep the priority list to a maximum of 3-5 items for clarity
- Ensure priorities align with the project's current goals and direction
- Adjust priorities based on resolved issues and completed features
