import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types based on OpenAPI schema
export interface CodeReviewRequest {
  code: string;
  language?: string | null;
  file_path?: string | null;
}

export interface ReviewRule {
  title: string;
  rule: string;
  description: string;
  code: string;
  suggestion: string;
  lineNumber: number;
  type: "critical" | "warning";
}

export interface CodeReviewResponse {
  success: boolean;
  message: string;
  review_results: ReviewRule[];
  positive_aspects: string[];
  recommendations: string[];
  overall_assessment: Record<string, any>;
  summary: string;
  language_detected: string;
  overall_score: number;
  total_issues: number;
  critical_count: number;
  warning_count: number;
}

export interface GitHubPRRequest {
  pr_url: string;
}

export interface FileReview {
  filename: string;
  language: string;
  status: string;
  review_results: ReviewRule[];
  positive_aspects: string[];
  recommendations: string[];
  overall_assessment: Record<string, any>;
  summary: string;
  language_detected: string;
  overall_score: number;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  additions: number;
  deletions: number;
}

export interface GitHubPRReviewResponse {
  success: boolean;
  message: string;
  pr_url: string;
  repository: string;
  branch: string;
  files_reviewed: number;
  overall_summary: string;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  overall_score: number;
  review_results: ReviewRule[];
  file_reviews: FileReview[];
  positive_aspects: string[];
  recommendations: string[];
}

export interface RuleUploadRequest {
  rules_text: string;
  rule_name: string;
  description: string;
}

export interface RuleUploadResponse {
  success: boolean;
  message: string;
  rule_name?: string;
  description?: string;
}

export interface RulesResponse {
  success: boolean;
  message: string;
  rules: any[];
}

export interface SearchRulesResponse {
  success: boolean;
  message: string;
  query: string;
  rules: any[];
}

export interface AnalysisRequest {
  code: string;
  language?: string | null;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

export interface RuleComplianceRequest {
  rule_text: string;
  code_snippet: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
}

export interface RootResponse {
  message: string;
  version: string;
  status: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Response types for delete operations
export interface DeleteRuleResponse {
  success: boolean;
  message: string;
  rule_id: string;
  rule_name?: string;
  rule_description?: string;
  chunk_index?: number;
  total_chunks?: number;
  deleted_at?: string;
  error_type?: string;
}

export interface DeleteRulesResponse {
  success: boolean;
  message: string;
  total_requested: number;
  successfully_deleted: number;
  not_found: number;
  deleted_rules: Array<{
    id: string;
    name: string;
    description: string;
    chunk_index: number;
  }>;
  not_found_ids: string[];
  deleted_at: string;
  rule_ids: string[];
  error_type?: string;
}

export class AICodeReviewService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    // Get base URL from environment variable or use default
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    this.api = axios.create({
      baseURL: this.baseURL,
      // timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response.data;
      },
      (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Root endpoint
  async getRoot(): Promise<RootResponse> {
    return await this.api.get('/');
  }

  // Health check endpoint
  async healthCheck(): Promise<HealthCheckResponse> {
    return await this.api.get('/health');
  }

  // Upload rules
  async uploadRules(request: RuleUploadRequest): Promise<RuleUploadResponse> {
    const formData = new FormData();
    formData.append('rules_text', request.rules_text);
    formData.append('rule_name', request.rule_name);
    formData.append('description', request.description);

    return await this.api.post('/api/rules/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Upload rules file
  async uploadRulesFile(file: File, ruleName: string, description: string): Promise<RuleUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rule_name', ruleName);
    formData.append('description', description);

    return await this.api.post('/api/rules/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get all rules
  async getRules(): Promise<RulesResponse> {
    return await this.api.get('/api/rules');
  }

  // Get rule by name
  async getRuleByName(ruleName: string): Promise<RulesResponse> {
    return await this.api.get(`/api/rules/${encodeURIComponent(ruleName)}`);
  }

  // Search rules
  async searchRules(query: string, nResults: number = 10): Promise<SearchRulesResponse> {
    return await this.api.get('/api/rules/search', {
      params: { query, n_results: nResults }
    });
  }

  // Clear all rules
  async clearRules(): Promise<RuleUploadResponse> {
    return await this.api.delete('/api/rules');
  }

  /**
   * Delete a specific rule by its ID
   * @param ruleId - The ID of the rule to delete
   * @returns Promise with deletion result
   */
  async deleteRuleById(ruleId: string): Promise<DeleteRuleResponse> {
    return await this.api.delete(`/api/rules/${ruleId}`);
  }

  /**
   * Delete multiple rules by their IDs
   * @param ruleIds - Array of rule IDs to delete
   * @returns Promise with bulk deletion result
   */
  async deleteRulesByIds(ruleIds: string[]): Promise<DeleteRulesResponse> {
    return await this.api.delete('/api/rules/bulk', {
      data: { rule_ids: ruleIds }
    });
  }

  // Delete rules by name
  async deleteRulesByName(ruleName: string): Promise<RuleUploadResponse> {
    return await this.api.delete(`/api/rules/name/${encodeURIComponent(ruleName)}`);
  }

  // Security analysis
  async analyzeSecurity(request: AnalysisRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('code', request.code);
    if (request.language) {
      formData.append('language', request.language);
    }

    return await this.api.post('/api/analysis/security', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Performance analysis
  async analyzePerformance(request: AnalysisRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('code', request.code);
    if (request.language) {
      formData.append('language', request.language);
    }

    return await this.api.post('/api/analysis/performance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Comprehensive analysis
  async comprehensiveAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('code', request.code);
    if (request.language) {
      formData.append('language', request.language);
    }

    return await this.api.post('/api/analysis/comprehensive', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Rule compliance analysis
  async analyzeRuleCompliance(request: RuleComplianceRequest): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('rule_text', request.rule_text);
    formData.append('code_snippet', request.code_snippet);

    return await this.api.post('/api/analysis/rule-compliance', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Review code snippet
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    return await this.api.post('/api/review/code', request);
  }

  // Review GitHub PR
  async reviewGitHubPR(request: GitHubPRRequest): Promise<GitHubPRReviewResponse> {
    return await this.api.post('/api/review/github-pr', request);
  }

  // Review code text (form-based)
  async reviewCodeText(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    const formData = new FormData();
    formData.append('code', request.code);
    if (request.language) {
      formData.append('language', request.language);
    }
    if (request.file_path) {
      formData.append('file_path', request.file_path);
    }

    return await this.api.post('/api/review/code-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Update base URL
  updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
    this.api.defaults.baseURL = newBaseURL;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create default instance using environment variable
export const aiCodeReviewService = new AICodeReviewService();

// Export individual functions for convenience
export const {
  getRoot,
  healthCheck,
  uploadRules,
  uploadRulesFile,
  getRules,
  getRuleByName,
  searchRules,
  clearRules,
  deleteRuleById,
  deleteRulesByIds,
  deleteRulesByName,
  analyzeSecurity,
  analyzePerformance,
  comprehensiveAnalysis,
  analyzeRuleCompliance,
  reviewCode,
  reviewGitHubPR,
  reviewCodeText,
} = aiCodeReviewService;
