import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types based on OpenAPI schema
export interface CodeReviewRequest {
  code: string;
  language?: string | null;
}

export interface CodeReviewResponse {
  success: boolean;
  error?: string | null;
  response?: string | null;
  metadata?: any | null;
  fixed_code?: string | null;
  fixes_applied?: string[] | null;
}

export interface GitHubPRRequest {
  pr_url: string;
}

export interface CustomRuleRequest {
  title: string;
  content: string;
  language?: string;
  category?: string;
  severity?: string;
}

export interface RuleResponse {
  title: string;
  content: string;
  language: string;
  category: string;
  severity: string;
}

export interface HealthCheckResponse {
  status: string;
  components: Record<string, boolean>;
  message: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export class AICodeReviewService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    // Get base URL from environment variable or use default
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
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
        return response;
      },
      (error) => {
        console.error('Response error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Health check endpoint
  async healthCheck(): Promise<HealthCheckResponse> {
    const response: AxiosResponse<HealthCheckResponse> = await this.api.get('/health');
    return response.data;
  }

  // Root endpoint
  async getRoot(): Promise<Record<string, string>> {
    const response: AxiosResponse<Record<string, string>> = await this.api.get('/');
    return response.data;
  }

  // Review code snippet
  async reviewCode(request: CodeReviewRequest): Promise<CodeReviewResponse> {
    const response: AxiosResponse<CodeReviewResponse> = await this.api.post('/review/code', request);
    return response.data;
  }

  // Review GitHub PR
  async reviewGitHubPR(request: GitHubPRRequest): Promise<CodeReviewResponse> {
    const response: AxiosResponse<CodeReviewResponse> = await this.api.post('/review/pr', request);
    return response.data;
  }

  // Review uploaded file
  async reviewUploadedFile(file: File, language?: string): Promise<CodeReviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (language) {
      formData.append('language', language);
    }

    const response: AxiosResponse<CodeReviewResponse> = await this.api.post('/review/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Upload custom rule
  async uploadCustomRule(request: CustomRuleRequest): Promise<Record<string, string>> {
    const response: AxiosResponse<Record<string, string>> = await this.api.post('/rules/upload', request);
    return response.data;
  }

  // Get available rules
  async getRules(language?: string): Promise<RuleResponse[]> {
    const params = language ? { language } : {};
    const response: AxiosResponse<RuleResponse[]> = await this.api.get('/rules', { params });
    return response.data;
  }

  // Get rules statistics
  async getRulesStatistics(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.get('/rules/statistics');
    return response.data;
  }

  // Get supported languages
  async getSupportedLanguages(): Promise<string[]> {
    const response: AxiosResponse<string[]> = await this.api.get('/languages');
    return response.data;
  }

  // Test agent
  async testAgent(): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/test');
    return response.data;
  }

  // Evaluate code detailed
  async evaluateCodeDetailed(request: CodeReviewRequest): Promise<any> {
    const response: AxiosResponse<any> = await this.api.post('/evaluate', request);
    return response.data;
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
  healthCheck,
  getRoot,
  reviewCode,
  reviewGitHubPR,
  reviewUploadedFile,
  uploadCustomRule,
  getRules,
  getRulesStatistics,
  getSupportedLanguages,
  testAgent,
  evaluateCodeDetailed,
} = aiCodeReviewService;
