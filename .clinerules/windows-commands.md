# Windows Command Usage Guidelines

## Brief overview
These guidelines define how to properly use Windows PowerShell commands when working on Windows hosts, particularly when PowerShell 7.x or higher is available. Following these practices ensures consistent command usage across the project and maximizes compatibility with Windows environments.

## PowerShell version detection
- Always check for PowerShell version 7.x or higher before using advanced PowerShell features
- Use `$PSVersionTable.PSVersion` to determine the installed PowerShell version
- For scripts that require PowerShell 7+, include version checking at the beginning
- When PowerShell 7+ is not available, provide fallback options using PowerShell 5.1 compatible commands

## Command equivalents
- Use `Invoke-WebRequest` instead of `curl` or `wget` for HTTP requests
- Use `Get-Content` instead of `cat` for displaying file contents
- Use `Select-String` instead of `grep` for text searching
- Use `Get-ChildItem` (or alias `dir`) instead of `ls` for directory listings
- Use `Copy-Item` instead of `cp` for copying files
- Use `Move-Item` instead of `mv` for moving files
- Use `Remove-Item` instead of `rm` for deleting files
- Use `New-Item` instead of `touch` for creating new files
- Use `Test-Path` instead of `test -e` for checking if a file exists
- Use `Compare-Object` instead of `diff` for comparing files

## Parameter formatting
- Use PowerShell's named parameter syntax with hyphens (e.g., `-Path`, `-Destination`)
- Prefer full parameter names over aliases for better readability and maintainability
- Use proper PowerShell parameter types (strings don't always need quotes, arrays use comma separation)
- For complex parameters, use splatting with hashtables for better readability

## Pipeline usage
- Leverage PowerShell's object-based pipeline instead of text-based piping
- Use `|` to pipe objects between commands, not just text
- Take advantage of object properties rather than text parsing when possible
- Use `ForEach-Object` (or alias `%`) for iterating through pipeline objects

## Error handling
- Use `try/catch` blocks for proper error handling in PowerShell scripts
- Set `$ErrorActionPreference = 'Stop'` to make non-terminating errors behave like terminating errors
- Use `-ErrorAction` parameter to control how errors are handled for specific commands
- Capture and log errors appropriately using `$Error` collection

## Script execution
- Be aware of PowerShell execution policies and their impact on script execution
- Use appropriate methods to handle execution policy restrictions when necessary
- For cross-platform compatibility, consider using PowerShell Core (7+) features
- Document any PowerShell-specific requirements in script headers
