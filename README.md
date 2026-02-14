# Jest Code Coverage Diff

A demonstration project showcasing **line-level code coverage diff** in GitHub Actions - similar to SonarCloud's quality gates for new code.

## 🎯 Overview

This project demonstrates how to implement precise code coverage tracking for pull requests by analyzing **only the lines you changed**, not the entire codebase. This approach helps teams:

- Focus on maintaining high test coverage for new code
- Avoid being penalized for legacy code with low coverage
- Get actionable feedback on untested changes
- Enforce quality gates for new development

## ✨ Features

- **Line-Level Analysis**: Calculates coverage for exact changed lines, not entire files
- **GitHub Actions Integration**: Automated coverage diff on every pull request
- **Visual Reports**: Clear markdown comments showing coverage by file
- **Configurable Thresholds**: Set minimum coverage requirements (default: 70%)
- **Sample Components**: Demonstrates various coverage scenarios:
  - `Counter`: 100% coverage (best practice example)
  - `Calculator`: ~85% coverage (intentional gaps for demonstration)
  - `math utils`: ~60% coverage (shows partial coverage patterns)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/jest-code-coverage-diff.git
cd jest-code-coverage-diff

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

### Local Coverage Diff

To test the coverage diff script locally:

```bash
# Generate coverage first
npm run test:coverage

# Run coverage diff against main branch
npm run coverage:diff
```

## 🔧 How It Works

### 1. Git Diff Parsing

The script extracts exact line numbers changed in your PR:

```bash
git diff origin/main...HEAD --unified=0 --diff-filter=AM
```

Example output parsing:
```
@@ -15,0 +16,5 @@
+export const power = (base: number, exp: number) => {
+  return Math.pow(base, exp);
+};
```
→ Extracts lines 16-20 as changed

### 2. LCOV Coverage Analysis

Jest generates `coverage/lcov.info` with line-by-line coverage:

```
SF:src/utils/math.ts
DA:16,1   ← Line 16 covered
DA:17,1   ← Line 17 covered
DA:18,0   ← Line 18 NOT covered
```

### 3. Coverage Calculation

For each changed line:
- ✅ Covered: Line appears in LCOV with hit count > 0
- ❌ Uncovered: Line missing from LCOV or hit count = 0

**Coverage % = (Covered Lines / Total Changed Lines) × 100**

### 4. GitHub Comment

The workflow posts a detailed comment on your PR:

```markdown
## 📊 Code Coverage Report for Changed Lines

### Overall New Code Coverage: 85.5% ✅

**Status:** PASS (Threshold: 70%)

### Coverage by File

| File | Changed Lines | Covered Lines | Coverage | Status |
|------|---------------|---------------|----------|--------|
| src/components/Calculator.tsx | 15 | 14 | 93.3% | ✅ |
| src/utils/math.ts | 8 | 6 | 75.0% | ✅ |
```

## 📁 Project Structure

```
jest-code-coverage-diff/
├── .github/workflows/
│   └── coverage-diff.yml          # GitHub Actions workflow
├── scripts/
│   ├── types.ts                   # TypeScript type definitions
│   └── coverage-diff.ts           # Line-level coverage analysis script
├── src/
│   ├── components/
│   │   ├── Calculator/            # Complex component (partial coverage)
│   │   └── Counter/               # Simple component (100% coverage)
│   ├── utils/
│   │   └── math.ts                # Utility functions (mixed coverage)
│   └── App.tsx                    # Main application
├── jest.config.ts                 # Jest configuration (LCOV enabled)
├── package.json
└── README.md
```

## ⚙️ Configuration

### Coverage Threshold

Edit `scripts/coverage-diff.ts`:

```typescript
const COVERAGE_THRESHOLD = 70; // Change to your desired percentage
```

### Jest Coverage Settings

Edit `jest.config.ts`:

```typescript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

### Excluded Files

The script automatically excludes:
- Test files (`*.test.ts`, `*.test.tsx`)
- Type definition files (`*.d.ts`)
- Non-source files (config, docs, etc.)

To modify exclusions, edit `parseGitDiff()` in `scripts/coverage-diff.ts`.

## 🔄 GitHub Actions Workflow

The workflow runs on every pull request to `main`:

1. **Checkout**: Fetches full history for accurate diffs
2. **Install**: Installs dependencies with npm ci
3. **Test**: Runs Jest with coverage enabled
4. **Analyze**: Executes custom coverage-diff.ts script
5. **Comment**: Posts results to PR (auto-updates on new commits)
6. **Artifact**: Uploads full coverage report

### Workflow Permissions

Required in `.github/workflows/coverage-diff.yml`:

```yaml
permissions:
  contents: read
  pull-requests: write  # For posting comments
```

## 📊 Example Scenarios

### Scenario 1: High Coverage (Pass)

```typescript
// Add new function
export const square = (n: number) => n * n;

// Add comprehensive test
it('squares numbers', () => {
  expect(square(5)).toBe(25);
});
```

**Result**: ✅ 100% coverage → Workflow passes

### Scenario 2: Low Coverage (Fail)

```typescript
// Add complex function
export const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// No tests added!
```

**Result**: ❌ 0% coverage → Workflow fails with clear message

### Scenario 3: Partial Coverage

```typescript
// Add function with multiple branches
export const divide = (a: number, b: number) => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};

// Test only happy path
it('divides numbers', () => {
  expect(divide(10, 2)).toBe(5);
});
// Edge case (b === 0) not tested!
```

**Result**: ⚠️ 66.7% coverage → Shows uncovered lines

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:ci` - Run tests in CI mode
- `npm run coverage:diff` - Run coverage diff locally

### Adding New Components

1. Create component in `src/components/YourComponent/`
2. Add tests in `YourComponent.test.tsx`
3. Import in `App.tsx`
4. Run `npm run test:coverage` to verify coverage

## 🧪 Testing

This project uses:
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **ts-jest** - TypeScript support
- **@testing-library/user-event** - User interaction simulation

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

it('increments count', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByLabelText('increment'));
  expect(screen.getByText('Counter: 1')).toBeInTheDocument();
});
```

## 🎓 Learn More

### Key Concepts

- **Line Coverage**: Percentage of executable lines run during tests
- **Branch Coverage**: Percentage of decision paths tested (if/else, switch)
- **LCOV Format**: Standard coverage report format used by many tools
- **Git Diff Unified Format**: Shows line-by-line changes with context

### Comparison to Other Tools

| Feature | This Project | SonarCloud | Codecov |
|---------|--------------|------------|---------|
| Line-level diff | ✅ | ✅ | Partial |
| Self-hosted | ✅ | ❌ | ❌ |
| Free for private repos | ✅ | Limited | Limited |
| Custom thresholds | ✅ | ✅ | ✅ |
| GitHub integration | ✅ | ✅ | ✅ |

### Resources

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [LCOV Format Specification](http://ltp.sourceforge.net/coverage/lcov/geninfo.1.php)
- [Git Diff Format](https://git-scm.com/docs/git-diff)
- [GitHub Actions](https://docs.github.com/en/actions)
- [React Testing Library](https://testing-library.com/react)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests (your PR will get coverage analysis!)
- Improve documentation

## 💡 Inspiration

This project was inspired by SonarCloud's "New Code" quality gates, which focus on maintaining quality for new development rather than requiring 100% coverage across legacy code.

---

**Made with ❤️ to promote better testing practices**
