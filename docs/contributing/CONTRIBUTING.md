# Contributing to Weekly Weave Bot

Thank you for your interest in contributing to the Weekly Weave Bot! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing opinions and experiences

## How to Contribute

### Reporting Issues

1. Check if the issue already exists
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (if applicable)
   - Expected vs actual behavior
   - Environment details (Node version, OS, etc.)

### Suggesting Features

1. Open a discussion issue first
2. Describe the use case
3. Explain why it would benefit the project
4. Be open to feedback and alternatives

### Submitting Code

#### 1. Fork and Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/weekly-weave-bot.git
cd weekly-weave-bot
git remote add upstream https://github.com/ORIGINAL_OWNER/weekly-weave-bot.git
```

#### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

#### 3. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

#### 4. Test Your Changes

```bash
# Run all tests
npm test

# Type checking
npm run type-check

# Linting (if available)
npm run lint
```

#### 5. Commit Your Changes

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add Discord bot support"
git commit -m "fix: correct date parsing for recurring events"
git commit -m "docs: update setup guide with Discord instructions"
```

Commit message format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `chore:` - Build process or auxiliary tool changes

#### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference any related issues
- Screenshots/examples if applicable

## Development Guidelines

### Code Style

1. **TypeScript First**
   - Use proper types, avoid `any`
   - Leverage TypeScript's type system
   - Document complex types

2. **Error Handling**
   ```typescript
   // Good
   try {
     const result = await operation();
     return result;
   } catch (error) {
     logger.error('Operation failed:', error);
     throw new OperationError('Failed to complete operation', { cause: error });
   }
   ```

3. **Async/Await**
   - Prefer async/await over callbacks
   - Handle promise rejections
   - Use Promise.all for parallel operations

4. **Testing**
   - Write tests for new features
   - Maintain existing test coverage
   - Test edge cases and error scenarios

### Documentation

- Update README.md if adding major features
- Document new configuration options
- Add JSDoc comments for public APIs
- Update relevant guides in docs/

### API Design

When adding new interfaces or modifying existing ones:

1. Maintain backward compatibility when possible
2. Document breaking changes clearly
3. Follow existing patterns and conventions
4. Consider extensibility

## Pull Request Process

1. **Before Submitting**
   - Rebase on latest main branch
   - Ensure all tests pass
   - Update documentation
   - Self-review your code

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tests pass locally
   - [ ] New tests added (if applicable)
   
   ## Checklist
   - [ ] Code follows project style
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No console.logs left in code
   ```

3. **Review Process**
   - Address reviewer feedback
   - Keep discussions focused and professional
   - Be patient - reviews take time

## Testing Guidelines

### Writing Tests

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should handle normal cases', async () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = await feature.method(input);
      
      // Assert
      expect(result).toMatchExpectedOutput();
    });
    
    it('should handle error cases', async () => {
      // Test error scenarios
    });
  });
});
```

### Test Coverage

- Aim for high coverage but focus on meaningful tests
- Test public APIs thoroughly
- Include edge cases and error paths
- Mock external dependencies

## Getting Help

- Check existing documentation
- Look through closed issues
- Ask in discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Project documentation (for major features)

Thank you for contributing to make Weekly Weave Bot better!