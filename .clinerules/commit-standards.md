# Commit Message Standards

## Brief overview
These guidelines define the specific standards for creating git commit messages in this project. Ensuring commit messages are concise, descriptive, and consistently formatted improves project history readability and helps maintain clear documentation of changes.

## Message format
- ALWAYS use a conventional commit format: `type: short description`
- Common types include: Fix, Feature, Refactor, Docs, Test, Chore, Style
- Start with a capital letter but do not end with a period
- Use imperative mood (e.g., "Add feature" not "Added feature" or "Adds feature")
- Keep the first line to a strict 50 characters maximum
- Follow subject line with a blank line, then an optional body if more detail is needed

## Message length
- ALWAYS keep commit message subjects concise to fit within de-facto length limits (50 characters)
- If additional explanation is needed, add it in the commit body, keeping each line to 72 characters
- Avoid redundant information that's already captured in the diff
- Use bullet points in the body for multiple related changes

## Message content
- Make messages specific and actionable
- Clearly communicate what changed and why (not how - that's in the code)
- Reference issue numbers when applicable using the format: `(#123)`
- Include context only if it's not obvious from the code change itself
- For breaking changes, mark with `BREAKING CHANGE:` in the commit body

## Examples
Good:
```
Fix: Resolve compatibility issue with jsPDF library
Feature: Add proportional string spacing option
Refactor: Simplify fretboard rendering algorithm
```

Bad:
```
fixed bug
updated several files to fix the problems with the thing
Feature: this commit adds a really really long description that goes way beyond the 50 character limit
```

## Review process
- Always review commit messages before finalizing
- Ensure messages accurately represent the changes
- Check that message length adheres to the 50/72 character rule
- Verify that commit scope is appropriate (not too large or small)
