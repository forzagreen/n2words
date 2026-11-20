# Security Policy

## Supported Versions

Only the latest major version receives security updates.

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

## Verifying a Release

Each release is one tarball, `n2words-X.Y.Z.tgz`, packed once by
[`release.yml`](.github/workflows/release.yml) and published unchanged to npm
and to the GitHub release. Beside it on the release is
`n2words-X.Y.Z.tgz.sigstore.json`, the attestation of where it was built,
signed by that workflow running on `main`. Releases whose asset is a `.zip`
came before the bundle, and every 6.x release among them carries npm's
provenance instead (below).

### Check where it was built

Download the tarball and its bundle from the release. The tarball from npm
(`npm pack n2words@X.Y.Z`) is the same file.

```sh
gh release download vX.Y.Z --repo forzagreen/n2words --pattern 'n2words-X.Y.Z.tgz*'

gh attestation verify n2words-X.Y.Z.tgz \
  --bundle n2words-X.Y.Z.tgz.sigstore.json \
  --repo forzagreen/n2words \
  --signer-workflow forzagreen/n2words/.github/workflows/release.yml \
  --source-ref refs/heads/main
```

Keep `--signer-workflow` and `--source-ref`: with `--repo` alone, an
attestation from any workflow in the repository, run from any branch, passes.

In a terminal, a pass lists the policy it enforced and ends:

```text
✓ Verification succeeded!

The following 1 attestation matched the policy criteria

- Attestation #1
  - Build repo:..... forzagreen/n2words
  - Build workflow:. .github/workflows/release.yml@refs/heads/main
  - Signer repo:.... forzagreen/n2words
  - Signer workflow: .github/workflows/release.yml@refs/heads/main
```

A failure exits non-zero, and its message may not say which check failed.
Run from a script, a pass prints nothing, so a script asks for the signer and
compares it, rather than trusting the exit status alone:

```sh
gh attestation verify n2words-X.Y.Z.tgz \
  --bundle n2words-X.Y.Z.tgz.sigstore.json \
  --repo forzagreen/n2words \
  --signer-workflow forzagreen/n2words/.github/workflows/release.yml \
  --source-ref refs/heads/main \
  --format json \
  --jq '.[].verificationResult.signature.certificate.subjectAlternativeName'
```

which prints, for a release:

```text
https://github.com/forzagreen/n2words/.github/workflows/release.yml@refs/heads/main
```

The release workflow runs this same check on each bundle before attaching it.

**With no network:** fetch the trusted root while online, then add
`--custom-trusted-root trusted_root.jsonl` to the command above.

```sh
gh attestation trusted-root > trusted_root.jsonl
```

**Without the bundle:** leave out `--bundle`, and gh fetches the attestation
from GitHub instead. That also confirms the attestation belongs to the
repository that holds the name today, which a bundle on disk cannot.

**Through npm:** `npm audit signatures`, run in a project that has installed
n2words, checks npm's registry signature and its provenance attestation, which
the same release run makes. n2words is counted among the packages with "a
verified attestation".

### Rebuild it

The tag holds everything the tarball is built from, and `NODE_VERSION` in the
tag's `release.yml` names the Node it was built with. Built with that Node,
the tarball comes out byte for byte the same:

```sh
git clone --branch vX.Y.Z --depth 1 https://github.com/forzagreen/n2words.git
cd n2words
grep 'NODE_VERSION:' .github/workflows/release.yml   # put this Node on PATH
npm ci
npm pack
sha256sum n2words-X.Y.Z.tgz   # the digest of the tarball on npm and on the release
```

The 6.x releases made before `NODE_VERSION` named an exact version were built
with these, as each release run's log records:

| Release | Node |
| --- | --- |
| v6.3.0 | 26.10.0 |
| v6.2.0 | 26.8.2 |
| v6.0.0 to v6.1.2 | 26.8.1 |

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
- [ ] Dependencies are up to date and pass CI's security audit (audit-ci, which `npx audit-ci --config ./audit-ci.jsonc` runs locally; any advisory set aside is listed in `audit-ci.jsonc` with its reason)
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

**Last Updated**: 2026-11-18
