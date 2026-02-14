// Type definitions for coverage diff analysis

export interface ChangedLine {
  file: string;
  lineNumber: number;
}

export interface FileCoverage {
  file: string;
  coveredLines: Set<number>;
  executableLines: Set<number>;
}

export interface FileResult {
  file: string;
  totalChangedLines: number;
  coveredChangedLines: number;
  uncoveredLines: number[];
  coveragePercentage: number;
}

export interface CoverageSummary {
  totalChangedLines: number;
  totalCoveredLines: number;
  overallPercentage: number;
  fileResults: FileResult[];
  threshold: number;
  passed: boolean;
}

export interface GitDiffResult {
  changedLines: Map<string, Set<number>>;
}

export interface LcovData {
  fileCoverageMap: Map<string, FileCoverage>;
}
