# Contributing to AI Control Framework

## Welcome Contributors!

We're excited that you're interested in contributing to the AI Control Framework. This project helps developers ship production-ready code faster by enforcing discipline in AI-assisted development.

## How to Contribute

### 1. Report Issues
- Use GitHub Issues to report bugs
- Include your OS, framework version, and steps to reproduce
- Check existing issues first to avoid duplicates

### 2. Suggest Features
- Open a discussion first for major features
- Explain the problem it solves
- Provide use cases and examples

### 3. Submit Pull Requests

#### Before You Start
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly using `./validate-framework.sh`
5. Update documentation if needed

#### Code Standards
- Keep scripts POSIX-compliant where possible
- Add comments for complex logic
- Follow existing naming conventions
- Ensure all scripts are executable (`chmod +x`)

#### Commit Messages
Format: `type: description`

Types:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `test:` Test additions/changes
- `refactor:` Code restructuring
- `perf:` Performance improvements

Example: `feat: add Python project detection in assess-project.sh`

### 4. Add Language-Specific Patterns

We especially welcome patterns for different languages and frameworks:

1. Create a new pattern file in `ai-framework/templates/patterns/`
2. Follow the existing pattern format
3. Include success metrics and examples
4. Test with real projects

### 5. Improve Documentation

- Fix typos and clarify confusing sections
- Add examples and use cases
- Translate documentation
- Create video tutorials

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-control-framework.git
cd ai-control-framework

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/ai-control-framework.git

# Create branch
git checkout -b feature/your-feature

# Make changes and test
./validate-framework.sh

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

## Testing

Always run validation before submitting:

```bash
./validate-framework.sh
```

This runs:
- Installation tests
- Contract validation
- Mock detection
- Scope control
- DRS calculation
- Integration tests

## Priority Areas

Current priorities for contributions:

1. **Language Support**
   - Python patterns and detection
   - Java/Spring patterns
   - Go patterns
   - Rust patterns

2. **CI/CD Integration**
   - GitHub Actions workflows
   - GitLab CI templates
   - Jenkins pipelines
   - Azure DevOps

3. **IDE Integration**
   - VS Code extension
   - IntelliJ plugin
   - Vim/Neovim integration

4. **Platform Support**
   - Native Windows PowerShell scripts
   - Better WSL support
   - Docker containerization

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information
- Other unprofessional conduct

## Recognition

Contributors are recognized in:
- The README.md contributors section
- Release notes
- The project website (coming soon)

## Questions?

- Open a GitHub Discussion
- Check existing documentation
- Review closed issues for similar questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make AI-assisted development more disciplined and productive! 🚀