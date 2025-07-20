# Documentation Structure

```
docs/
├── README.md                    # Documentation index and overview
├── STRUCTURE.md                # This file - explains the documentation organization
│
├── setup/                      # Setup and installation guides
│   ├── QUICKSTART.md          # 5-minute quick start guide
│   ├── SETUP_GUIDE.md         # Complete setup instructions with troubleshooting
│   └── airtable-setup.md      # Airtable-specific setup instructions
│
├── architecture/              # Technical architecture documentation
│   └── AI_ASSISTANT_CONTEXT.md # Comprehensive technical overview (formerly CLAUDE.md)
│
├── api/                       # API and interface documentation
│   └── INTERFACES.md          # Core interfaces and data types
│
├── development/               # Development guides
│   └── DEVELOPMENT_GUIDE.md   # Development workflow and best practices
│
├── testing/                   # Testing documentation
│   ├── TESTING_GUIDE.md       # How to run and write tests
│   ├── TESTING_EXPLAINED.md   # Testing philosophy and approach
│   └── TEST_RESULTS.md        # Current test suite status
│
└── contributing/              # Contribution guidelines
    └── CONTRIBUTING.md        # How to contribute to the project
```

## Document Purposes

### Setup Documentation (`/setup`)
- **QUICKSTART.md**: For users who want to get running quickly
- **SETUP_GUIDE.md**: Comprehensive guide with all details and troubleshooting
- **airtable-setup.md**: Specific instructions for Airtable configuration

### Architecture Documentation (`/architecture`)
- **AI_ASSISTANT_CONTEXT.md**: Technical deep-dive for developers and AI assistants

### API Documentation (`/api`)
- **INTERFACES.md**: Reference for all interfaces, types, and bot commands

### Development Documentation (`/development`)
- **DEVELOPMENT_GUIDE.md**: Best practices, workflows, and coding standards

### Testing Documentation (`/testing`)
- **TESTING_GUIDE.md**: Practical guide to running tests
- **TESTING_EXPLAINED.md**: Why tests are structured as they are
- **TEST_RESULTS.md**: Current status of the test suite

### Contributing Documentation (`/contributing`)
- **CONTRIBUTING.md**: Guidelines for contributing code, reporting issues, etc.

## Navigation Tips

1. **New users**: Start with [QUICKSTART.md](setup/QUICKSTART.md)
2. **Developers**: Read [AI_ASSISTANT_CONTEXT.md](architecture/AI_ASSISTANT_CONTEXT.md) and [DEVELOPMENT_GUIDE.md](development/DEVELOPMENT_GUIDE.md)
3. **Contributors**: Check [CONTRIBUTING.md](contributing/CONTRIBUTING.md)
4. **Troubleshooting**: See [SETUP_GUIDE.md](setup/SETUP_GUIDE.md#troubleshooting)