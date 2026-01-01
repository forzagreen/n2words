# Security Policy

## Supported Versions

We actively support the following versions of n2words with security updates:

| Version | Supported          | End of Life    |
| ------- | ------------------ | -------------- |
| 2.x     | :white_check_mark: | -              |
| < 2.0   | :x:                | January 2025   |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

We take security seriously and appreciate responsible disclosure. If you discover a security vulnerability in n2words, please report it through one of the following channels:

### Preferred Method: GitHub Security Advisories

1. Go to the [Security Advisories page](https://github.com/forzagreen/n2words/security/advisories)
2. Click "Report a vulnerability"
3. Fill out the advisory form with details

### Alternative Method: Email

If you prefer email or cannot use GitHub Security Advisories:

- Email: security@vigario.tech
- GPG encryption is encouraged for sensitive disclosures

## What to Include

When reporting a vulnerability, please include:

1. **Type of vulnerability** (e.g., injection, XSS, code execution)
2. **Full path** to affected source file(s)
3. **Location** of affected code (tag/branch/commit or direct URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if available)
6. **Impact** of the vulnerability
7. **Suggested fix** (if you have one)

## Response Timeline

- **Initial Response**: Within 48 hours of report
- **Status Update**: Within 7 days of report
- **Fix Timeline**: Varies by severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Best effort

## Disclosure Policy

- **Coordinated Disclosure**: We practice responsible disclosure
- **Embargo Period**: Security issues will be kept confidential until a fix is released
- **Credit**: Reporter will be credited (unless they prefer to remain anonymous)
- **CVE Assignment**: CVEs will be requested for qualifying vulnerabilities

## Security Best Practices

When using n2words in your applications:

1. **Input Validation**: Always validate and sanitize user input before passing to n2words
2. **Keep Updated**: Regularly update to the latest version for security patches
3. **Monitor Dependencies**: Use `npm audit` to check for known vulnerabilities
4. **Least Privilege**: Run applications with minimal necessary permissions

## Known Security Considerations

### Input Handling

n2words processes numeric inputs and converts them to strings. While the library validates input types, applications should:

- Validate that inputs are within expected ranges
- Sanitize outputs if used in HTML contexts (though n2words only outputs plain text)
- Be aware of potential DoS with extremely large numbers

### No Eval or Dynamic Code Execution

n2words does not use `eval()`, `Function()` constructor, or any dynamic code execution, reducing attack surface.

### Zero Dependencies

n2words has zero runtime dependencies, minimizing supply chain risks.

## Security Update Process

1. **Private Fix**: Security issues are fixed in a private fork
2. **Testing**: Comprehensive testing including edge cases
3. **CVE Assignment**: CVE is requested if applicable
4. **Release**: Patch version is released with security fix
5. **Announcement**: Security advisory is published
6. **Notification**: Users are notified via GitHub Security Advisories

## For Contributors: Security Checklist

When contributing code, ensure:

- [ ] Input validation for all user-provided values
- [ ] No use of `eval()`, `Function()`, or dynamic code execution
- [ ] No hardcoded credentials or sensitive data
- [ ] Dependencies are up to date (`npm audit`)
- [ ] No new dependencies without justification
- [ ] Consider DoS implications for large inputs
- [ ] Sanitize outputs if used in HTML contexts (though n2words outputs plain text)
- [ ] Follow principle of least privilege in examples

## Acknowledgments

We thank the following security researchers for responsible disclosure:

- (No vulnerabilities reported yet)

## Questions?

For questions about this policy or n2words security:

- Open a discussion on [GitHub Discussions](https://github.com/forzagreen/n2words/discussions)
- Contact maintainers (see package.json for contact info)

---

**Last Updated**: 2026-01-01
