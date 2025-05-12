# Technical Context: FretFind2D

## Technologies Used

### Core Technologies
- **HTML5**: Basic structure and form elements
- **CSS**: Styling and layout
- **JavaScript**: Core application logic and calculations
- **jQuery**: DOM manipulation and event handling (version 3.7.1)
- **jQuery Migrate**: Assists with migrating older jQuery code (version 3.4.1)
- **jQuery BBQ**: URL parameter handling for shareable designs

### Visualization Libraries
- **SVG.js**: Vector graphics library for in-browser visualization (version 3.2.0)
- **jsPDF**: PDF generation library

### File Generation
- **FileSaver.js**: Client-side file saving functionality
- **Base64.js**: Encoding utilities for file generation
- **sprintf.js**: String formatting for numerical output

### Data Formats
- **SVG**: Scalable Vector Graphics for visualization and export
- **DXF**: CAD format export for manufacturing
- **PDF**: Document format for printing templates
- **CSV/TAB**: Tabular data export for spreadsheet analysis
- **HTML**: Formatted tables for viewing in browser

## Development Environment

### Project Structure
```
FretFind2D/
├── src/
│   ├── fretfind.html     # Main application HTML
│   ├── fretfind.css      # Application styles
│   ├── fretfind.js       # Core application logic
│   └── libs/             # Third-party dependencies
│       ├── jquery-3.7.1.min.js
│       ├── jquery-migrate-3.4.1.min.js
│       ├── jquery-browser-fix.js
│       ├── jquery.ba-bbq.min.js
│       ├── svg.min.js
│       ├── FileSaver.min.js
│       ├── base64.js
│       ├── sprintf.js
│       └── jspdf.js
├── references/           # Reference implementations
│   ├── fromInkscape/     # Python implementation for Inkscape
│   └── fromModevia/      # PHP implementation
├── test/                 # Test files
└── docker/               # Docker configuration for local development
```

### Local Development Setup
- Local web server required for file generation features
- Options include:
  - Web Server for Chrome extension
  - Python's built-in HTTP server
  - Docker setup via provided docker-compose.yml

### Version Control
- Git repository hosted on GitHub
- Main repository: https://github.com/acspike/FretFind2D
- Fork available at: https://github.com/brotherdust/FretFind2D

## Technical Constraints

### Browser Compatibility
- Requires modern browsers with support for:
  - HTML5 Canvas
  - SVG
  - JavaScript ES5 features
  - Blob constructor API (for downloads)

### Performance Considerations
- Complex calculations performed in real-time on user input
- Large fretboard designs with many strings/frets may impact performance
- PDF generation of multi-page documents can be resource-intensive

### Security Constraints
- Client-side only application with no server component
- No external APIs or remote dependencies
- All processing occurs locally in the browser

## Dependencies

### Third-Party Libraries
| Library      | Version | Purpose                             | License    |
|--------------|---------|-------------------------------------|------------|
| jQuery       | 3.7.1   | DOM manipulation                    | MIT        |
| jQuery Migrate | 3.4.1 | jQuery version migration aid        | MIT        |
| jQuery BBQ   | -       | URL parameter handling              | MIT/GPL    |
| SVG.js       | 3.2.0   | Vector graphics / Interactive visualization | MIT        |
| FileSaver.js | -       | Client-side file saving             | MIT        |
| jsPDF        | -       | PDF generation                      | MIT        |
| sprintf.js   | -       | String formatting                   | BSD-3      |
| base64.js    | -       | Base64 encoding                     | MIT        |

### External Resources
- No external API dependencies
- No server-side components
- No CDN dependencies (all libraries included locally)

### Development Tools
- **MCP (Model Context Protocol) Servers**:
  - **Git MCP Server**: Integration with Git functionality through `uvx mcp-server-git`
  - **Context7 MCP Server**: Access to up-to-date library documentation through `npx -y @upstash/context7-mcp@latest`

## Tool Usage Patterns

### Mathematical Calculations
- **Scale Calculations**: Equal temperament (ET) or Scala file based
- **Geometric Calculations**: 2D coordinate system for fretboard modeling
- **String and Fret Positioning**: Complex algorithm for multi-scale layouts

### User Interface Patterns
- Form-based input for all parameters
- Real-time visualization updates on parameter change
- Toggle-based alternatives for various configuration options
- Interactive help system with toggleable detailed explanations

### Export Workflow
- User configures fretboard design
- Real-time preview shown in browser
- User selects desired output format
- Browser generates and prompts download of file

### URL Parameter System
- All form values can be serialized to URL parameters
- Designs can be bookmarked or shared via URL
- Parameters are decoded on page load to restore designs
