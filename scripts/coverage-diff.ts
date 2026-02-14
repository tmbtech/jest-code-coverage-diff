#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type {
  ChangedLine,
  FileCoverage,
  FileResult,
  CoverageSummary,
  GitDiffResult,
  LcovData,
} from './types';

const COVERAGE_THRESHOLD = 70; // Minimum percentage for new code coverage
const LCOV_PATH = 'coverage/lcov.info';

/**
 * Parses git diff to extract changed line numbers per file
 */
function parseGitDiff(baseRef: string = 'main'): GitDiffResult {
  console.log(`📊 Parsing git diff against ${baseRef}...`);

  try {
    // Get the diff with unified=0 to get exact line numbers
    const diffCommand = `git diff origin/${baseRef}...HEAD --unified=0 --diff-filter=AM`;
    const diff = execSync(diffCommand, { encoding: 'utf-8' });

    const changedLines = new Map<string, Set<number>>();
    const lines = diff.split('\n');

    let currentFile: string | null = null;

    for (const line of lines) {
      // Match file path: diff --git a/src/file.ts b/src/file.ts
      if (line.startsWith('diff --git')) {
        const match = line.match(/b\/(.+)$/);
        if (match) {
          currentFile = match[1];
        }
      }

      // Match added/modified line ranges: @@ -15,0 +16,5 @@
      else if (line.startsWith('@@') && currentFile) {
        // Extract the "new file" line range (+start,count)
        const match = line.match(/\+(\d+)(?:,(\d+))?/);
        if (match) {
          const start = parseInt(match[1], 10);
          const count = match[2] ? parseInt(match[2], 10) : 1;

          if (!changedLines.has(currentFile)) {
            changedLines.set(currentFile, new Set());
          }

          const fileLines = changedLines.get(currentFile)!;
          for (let i = 0; i < count; i++) {
            fileLines.add(start + i);
          }
        }
      }
    }

    // Filter out non-source files (tests, type definitions, scripts, config files)
    const sourceFiles = Array.from(changedLines.keys()).filter(file =>
      file.match(/\.(ts|tsx|js|jsx)$/) &&
      !file.match(/\.test\.(ts|tsx|js|jsx)$/) &&
      !file.includes('.d.ts') &&
      !file.startsWith('scripts/') &&
      !file.startsWith('__mocks__/')
    );

    const filteredChangedLines = new Map<string, Set<number>>();
    sourceFiles.forEach(file => {
      const lines = changedLines.get(file);
      if (lines && lines.size > 0) {
        filteredChangedLines.set(file, lines);
      }
    });

    console.log(`✅ Found ${filteredChangedLines.size} changed source files`);
    return { changedLines: filteredChangedLines };
  } catch (error) {
    console.error('❌ Error parsing git diff:', error);
    return { changedLines: new Map() };
  }
}

/**
 * Parses LCOV coverage report to extract covered lines per file
 */
function parseLcov(lcovPath: string): LcovData {
  console.log(`📖 Parsing LCOV file: ${lcovPath}...`);

  if (!fs.existsSync(lcovPath)) {
    console.error(`❌ LCOV file not found: ${lcovPath}`);
    return { fileCoverageMap: new Map() };
  }

  const lcovContent = fs.readFileSync(lcovPath, 'utf-8');
  const fileCoverageMap = new Map<string, FileCoverage>();

  const lines = lcovContent.split('\n');
  let currentFile: string | null = null;
  let coveredLines: Set<number> = new Set();
  let executableLines: Set<number> = new Set();

  for (const line of lines) {
    // SF: Source File
    if (line.startsWith('SF:')) {
      currentFile = line.substring(3);
      coveredLines = new Set();
      executableLines = new Set();
    }
    // DA: Line coverage data (line_number,hit_count)
    else if (line.startsWith('DA:') && currentFile) {
      const match = line.match(/^DA:(\d+),(\d+)/);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        const hitCount = parseInt(match[2], 10);

        executableLines.add(lineNum);
        if (hitCount > 0) {
          coveredLines.add(lineNum);
        }
      }
    }
    // end_of_record
    else if (line === 'end_of_record' && currentFile) {
      fileCoverageMap.set(currentFile, {
        file: currentFile,
        coveredLines: new Set(coveredLines),
        executableLines: new Set(executableLines),
      });
      currentFile = null;
    }
  }

  console.log(`✅ Parsed coverage for ${fileCoverageMap.size} files`);
  return { fileCoverageMap };
}

/**
 * Normalizes file path to match between git diff and LCOV
 */
function normalizeFilePath(filePath: string): string {
  // Remove leading ./ if present
  return filePath.replace(/^\.\//, '');
}

/**
 * Calculates coverage for changed lines only
 */
function calculateLineCoverage(
  gitDiffResult: GitDiffResult,
  lcovData: LcovData
): CoverageSummary {
  console.log('🔍 Calculating line-level coverage...');

  const fileResults: FileResult[] = [];
  let totalChangedLines = 0;
  let totalCoveredLines = 0;

  for (const [file, changedLineSet] of gitDiffResult.changedLines) {
    const normalizedFile = normalizeFilePath(file);

    // Try to find coverage data with different path formats
    let fileCoverage: FileCoverage | undefined;
    for (const [lcovFile, coverage] of lcovData.fileCoverageMap) {
      const normalizedLcovFile = normalizeFilePath(lcovFile);
      if (normalizedLcovFile === normalizedFile ||
          normalizedLcovFile.endsWith(normalizedFile) ||
          normalizedFile.endsWith(normalizedLcovFile)) {
        fileCoverage = coverage;
        break;
      }
    }

    if (!fileCoverage) {
      console.warn(`⚠️  No coverage data found for ${file}`);
      // Assume 0% coverage for files not in LCOV report
      const uncoveredLines = Array.from(changedLineSet).sort((a, b) => a - b);
      fileResults.push({
        file,
        totalChangedLines: changedLineSet.size,
        coveredChangedLines: 0,
        uncoveredLines,
        coveragePercentage: 0,
      });
      totalChangedLines += changedLineSet.size;
      continue;
    }

    // Calculate coverage for changed lines (only count executable lines)
    const changedLinesArray = Array.from(changedLineSet);

    // Filter to only executable lines (ignore comments, blank lines, etc.)
    const executableChangedLines = changedLinesArray.filter(lineNum =>
      fileCoverage!.executableLines.has(lineNum)
    );

    const coveredChangedLines = executableChangedLines.filter(lineNum =>
      fileCoverage!.coveredLines.has(lineNum)
    );

    const uncoveredLines = executableChangedLines
      .filter(lineNum => !fileCoverage!.coveredLines.has(lineNum))
      .sort((a, b) => a - b);

    const coveragePercentage =
      executableChangedLines.length > 0
        ? (coveredChangedLines.length / executableChangedLines.length) * 100
        : 100;

    fileResults.push({
      file,
      totalChangedLines: executableChangedLines.length,
      coveredChangedLines: coveredChangedLines.length,
      uncoveredLines,
      coveragePercentage,
    });

    totalChangedLines += executableChangedLines.length;
    totalCoveredLines += coveredChangedLines.length;
  }

  const overallPercentage =
    totalChangedLines > 0 ? (totalCoveredLines / totalChangedLines) * 100 : 100;

  const passed = overallPercentage >= COVERAGE_THRESHOLD;

  console.log(`✅ Coverage calculation complete: ${overallPercentage.toFixed(2)}%`);

  return {
    totalChangedLines,
    totalCoveredLines,
    overallPercentage,
    fileResults,
    threshold: COVERAGE_THRESHOLD,
    passed,
  };
}

/**
 * Generates markdown report for GitHub comment
 */
function generateMarkdownReport(summary: CoverageSummary): string {
  const statusEmoji = summary.passed ? '✅' : '❌';
  const statusText = summary.passed ? 'PASS' : 'FAIL';

  let markdown = `## 📊 Code Coverage Report for Changed Lines\n\n`;
  markdown += `### Overall New Code Coverage: ${summary.overallPercentage.toFixed(2)}% ${statusEmoji}\n\n`;
  markdown += `**Status:** ${statusText} (Threshold: ${summary.threshold}%)\n\n`;

  if (summary.totalChangedLines === 0) {
    markdown += `ℹ️ No changed lines detected in source files.\n`;
    return markdown;
  }

  markdown += `---\n\n`;
  markdown += `### Coverage by File\n\n`;
  markdown += `| File | Changed Lines | Covered Lines | Coverage | Status |\n`;
  markdown += `|------|---------------|---------------|----------|--------|\n`;

  summary.fileResults
    .sort((a, b) => a.coveragePercentage - b.coveragePercentage)
    .forEach(result => {
      const status = result.coveragePercentage >= summary.threshold ? '✅' : '❌';
      markdown += `| ${result.file} | ${result.totalChangedLines} | ${result.coveredChangedLines} | ${result.coveragePercentage.toFixed(1)}% | ${status} |\n`;
    });

  markdown += `\n---\n\n`;
  markdown += `### 📈 Summary\n`;
  markdown += `- **Total changed lines:** ${summary.totalChangedLines}\n`;
  markdown += `- **Covered lines:** ${summary.totalCoveredLines}\n`;
  markdown += `- **Uncovered lines:** ${summary.totalChangedLines - summary.totalCoveredLines}\n`;
  markdown += `- **New code coverage:** ${summary.overallPercentage.toFixed(2)}%\n\n`;

  // Show uncovered lines
  const filesWithUncoveredLines = summary.fileResults.filter(
    r => r.uncoveredLines.length > 0
  );

  if (filesWithUncoveredLines.length > 0) {
    markdown += `### ⚠️ Uncovered Lines\n\n`;
    filesWithUncoveredLines.forEach(result => {
      markdown += `**${result.file}:**\n`;
      markdown += `- Lines: ${result.uncoveredLines.join(', ')}\n\n`;
    });
  }

  markdown += `---\n\n`;
  markdown += `💡 **Tip:** This report shows coverage for only the lines you changed/added in this PR, not the entire codebase.\n`;

  return markdown;
}

/**
 * Posts comment to GitHub PR (if running in CI)
 */
async function postGitHubComment(markdown: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const prNumber = process.env.PR_NUMBER;

  if (!token || !prNumber) {
    console.log('ℹ️  Not running in GitHub Actions PR context, skipping comment posting');
    console.log('\n' + markdown);
    return;
  }

  console.log('📝 Posting comment to GitHub PR...');

  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: token });

    // Extract owner and repo from git remote
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    const match = remoteUrl.match(/github\.com[:/](.+?)\/(.+?)(\.git)?$/);

    if (!match) {
      console.error('❌ Could not parse GitHub repository from remote URL');
      return;
    }

    const [, owner, repo] = match;

    // Post the comment
    await octokit.issues.createComment({
      owner,
      repo: repo.replace('.git', ''),
      issue_number: parseInt(prNumber, 10),
      body: markdown,
    });

    console.log('✅ Comment posted successfully');
  } catch (error) {
    console.error('❌ Error posting comment to GitHub:', error);
    // Still output to console for debugging
    console.log('\n' + markdown);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting line-level coverage diff analysis...\n');

  // Get base ref from environment or default to 'main'
  const baseRef = process.env.BASE_REF || 'main';

  // Check if coverage file exists
  if (!fs.existsSync(LCOV_PATH)) {
    console.error(`❌ Coverage file not found: ${LCOV_PATH}`);
    console.error('Please run tests with coverage first: npm run test:coverage');
    process.exit(1);
  }

  // Parse git diff
  const gitDiffResult = parseGitDiff(baseRef);

  if (gitDiffResult.changedLines.size === 0) {
    console.log('ℹ️  No source file changes detected');
    const summary: CoverageSummary = {
      totalChangedLines: 0,
      totalCoveredLines: 0,
      overallPercentage: 100,
      fileResults: [],
      threshold: COVERAGE_THRESHOLD,
      passed: true,
    };
    const markdown = generateMarkdownReport(summary);
    await postGitHubComment(markdown);
    process.exit(0);
  }

  // Parse LCOV
  const lcovData = parseLcov(LCOV_PATH);

  // Calculate coverage
  const summary = calculateLineCoverage(gitDiffResult, lcovData);

  // Generate report
  const markdown = generateMarkdownReport(summary);

  // Post to GitHub (if in CI)
  await postGitHubComment(markdown);

  // Exit with appropriate code
  if (summary.passed) {
    console.log(`\n✅ Coverage check passed: ${summary.overallPercentage.toFixed(2)}% >= ${summary.threshold}%`);
    process.exit(0);
  } else {
    console.log(`\n❌ Coverage check failed: ${summary.overallPercentage.toFixed(2)}% < ${summary.threshold}%`);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
