# Publishing nextjs-croner to npm

This guide walks you through publishing nextjs-croner to the npm registry.

## Prerequisites

1. **npm Account**: Create one at https://www.npmjs.com/signup if you don't have one
2. **Verify Email**: Check your email and verify your npm account
3. **npm CLI**: Make sure you have npm installed (`npm --version`)

## Step 1: Login to npm

```bash
npm login
```

You'll be prompted for:
- Username: Your npm username
- Password: Your npm password
- Email: Your email address associated with npm

This creates an authentication token in your `~/.npmrc` file.

**Verify login:**
```bash
npm whoami
```

Should output your npm username.

## Step 2: Verify Package Configuration

✅ Your package.json is already configured with:
- ✅ Correct `name`: `nextjs-croner`
- ✅ Version: `0.1.0` (increment this for future releases)
- ✅ `main`: Points to the compiled `dist/index.js`
- ✅ `types`: TypeScript definitions included
- ✅ `bin`: CLI entry point configured
- ✅ `files`: Only essential files are included
- ✅ Repository, bugs, and homepage links
- ✅ Keywords for discoverability
- ✅ MIT License

## Step 3: Build the Package

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` folder.

## Step 4: Test Locally (Optional)

Before publishing, you can test the package locally:

```bash
npm pack
```

This creates a `.tgz` file. You can extract and test it.

## Step 5: Publish to npm

```bash
npm publish
```

This will:
1. Run the `prepublishOnly` script (which runs `npm run build`)
2. Package your files (only those listed in `"files"` in package.json)
3. Upload to npm registry
4. Make it available at https://www.npmjs.com/package/nextjs-croner

**Expected output:**
```
npm notice Publishing to the public npm registry
npm notice 📦 nextjs-croner@0.1.0
npm notice === Tarball Contents ===
npm notice 1.2kB   package.json
npm notice 2.3kB   README.md
npm notice 1.1kB   LICENSE
npm notice 34.5kB  dist/
npm notice === Tarball Details ===
npm notice name:          nextjs-croner
npm notice version:       0.1.0
npm notice filename:      nextjs-croner-0.1.0.tgz
npm notice published-at:  2024-01-XX
```

## Step 6: Verify Publication

1. Check npm registry: https://www.npmjs.com/package/nextjs-croner
2. Install in a test project:
   ```bash
   npm install nextjs-croner
   ```
3. Verify it works:
   ```bash
   npx nextjs-croner --help
   ```

## Future Releases

For future updates, follow semantic versioning:

```bash
# Patch release (0.1.0 → 0.1.1) - bug fixes
npm version patch

# Minor release (0.1.0 → 0.2.0) - new features
npm version minor

# Major release (0.1.0 → 1.0.0) - breaking changes
npm version major
```

Then publish:
```bash
npm publish
```

## Troubleshooting

### "You must be logged in to publish"
```bash
npm login
```

### "Package name already taken"
Choose a unique name or use a scoped package: `@yourusername/nextjs-croner`
Update in package.json and try again.

### "No files found"
Ensure:
1. `dist/` folder exists: `npm run build`
2. Files listed in `"files"` field exist
3. Include essential files like README.md and LICENSE

### "Registry errors"
Check npm status: https://status.npmjs.org/

## Package.json Fields Explanation

```json
{
  "name": "nextjs-croner",              // Unique package name
  "version": "0.1.0",                   // Semantic version
  "description": "...",                 // Short description (searchable)
  "main": "dist/index.js",              // Entry point
  "types": "dist/index.d.ts",           // TypeScript definitions
  "bin": {                              // CLI executables
    "nextjs-croner": "dist/cli/index.js"
  },
  "files": [                            // Files to include in npm package
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [...],                    // For npm search
  "repository": {...},                  // GitHub repo link
  "bugs": {...},                        // Issues page
  "homepage": "...",                    // Project homepage
  "peerDependencies": {...},            // Required peer deps
  "dependencies": {...},                // Runtime dependencies
  "devDependencies": {...}              // Dev-only dependencies
}
```

## Publishing Best Practices

1. **Tag releases in git:**
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Keep CHANGELOG.md updated** with release notes

3. **Use meaningful commit messages** for traceability

4. **Test before publishing:**
   ```bash
   npm run build
   npm pack
   ```

5. **Document breaking changes** in release notes

6. **Set up CI/CD** (GitHub Actions) to automate publishing

## Need Help?

- npm Documentation: https://docs.npmjs.com/
- npm publish docs: https://docs.npmjs.com/cli/v9/commands/npm-publish
- Semantic versioning: https://semver.org/

Happy publishing! 🚀

