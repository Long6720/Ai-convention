import { 
  aiCodeReviewService, 
  reviewCode, 
  getRules, 
  healthCheck,
  type CodeReviewRequest 
} from './api-service';

// Example 1: Using the service instance directly
export async function exampleUsingServiceInstance() {
  try {
    // Health check
    const health = await aiCodeReviewService.healthCheck();
    console.log('Service health:', health);

    // Review code
    const reviewRequest: CodeReviewRequest = {
      code: 'function hello() { console.log("Hello World"); }',
      language: 'javascript'
    };
    
    const reviewResult = await aiCodeReviewService.reviewCode(reviewRequest);
    console.log('Code review result:', reviewResult);

    // Get rules
    const rules = await aiCodeReviewService.getRules('javascript');
    console.log('JavaScript rules:', rules);

  } catch (error) {
    console.error('Error using service instance:', error);
  }
}

// Example 2: Using individual exported functions
export async function exampleUsingIndividualFunctions() {
  try {
    // Health check
    const health = await healthCheck();
    console.log('Service health:', health);

    // Review code
    const reviewRequest: CodeReviewRequest = {
      code: 'def hello(): print("Hello World")',
      language: 'python'
    };
    
    const reviewResult = await reviewCode(reviewRequest);
    console.log('Code review result:', reviewResult);

    // Get rules for Python
    const rules = await getRules('python');
    console.log('Python rules:', rules);

  } catch (error) {
    console.error('Error using individual functions:', error);
  }
}

// Example 3: Custom base URL
export async function exampleWithCustomBaseURL() {
  try {
    // Create service with custom base URL (will override environment variable)
    const customService = new (await import('./api-service')).AICodeReviewService('https://api.example.com');
    
    // Update base URL dynamically
    customService.updateBaseURL('https://staging-api.example.com');
    console.log('Current base URL:', customService.getBaseURL());

    // Use the custom service
    const health = await customService.healthCheck();
    console.log('Custom service health:', health);

  } catch (error) {
    console.error('Error with custom base URL:', error);
  }
}

// Example 3b: Using environment variable
export async function exampleUsingEnvironmentVariable() {
  try {
    // Service will automatically use NEXT_PUBLIC_API_BASE_URL from .env
    const health = await aiCodeReviewService.healthCheck();
    console.log('Service health using env variable:', health);
    console.log('Current base URL from env:', aiCodeReviewService.getBaseURL());

  } catch (error) {
    console.error('Error using environment variable:', error);
  }
}

// Example 4: Error handling
export async function exampleWithErrorHandling() {
  try {
    // This will fail if the service is not running
    const health = await healthCheck();
    console.log('Health check successful:', health);
    
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error:', error.message);
    } else {
      // Something else happened
      console.error('Unexpected error:', error.message);
    }
  }
}

// Example 5: File upload
export async function exampleFileUpload(file: File) {
  try {
    const result = await aiCodeReviewService.reviewUploadedFile(file, 'typescript');
    console.log('File review result:', result);
    return result;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

// Example 6: GitHub PR review
export async function exampleGitHubPRReview(prUrl: string) {
  try {
    const result = await aiCodeReviewService.reviewGitHubPR({ pr_url: prUrl });
    console.log('GitHub PR review result:', result);
    return result;
  } catch (error) {
    console.error('GitHub PR review error:', error);
    throw error;
  }
}

// Example 7: Custom rule upload
export async function exampleCustomRuleUpload() {
  try {
    const customRule = {
      title: 'Custom ESLint Rule',
      content: 'Always use const instead of let when variable is not reassigned',
      language: 'javascript',
      category: 'best-practices',
      severity: 'medium'
    };
    
    const result = await aiCodeReviewService.uploadCustomRule(customRule);
    console.log('Custom rule upload result:', result);
    return result;
  } catch (error) {
    console.error('Custom rule upload error:', error);
    throw error;
  }
}

// Example 8: Batch operations
export async function exampleBatchOperations() {
  try {
    const promises = [
      healthCheck(),
      getRules(),
      aiCodeReviewService.getSupportedLanguages(),
      aiCodeReviewService.getRulesStatistics()
    ];
    
    const [health, rules, languages, statistics] = await Promise.all(promises);
    
    console.log('Batch results:', {
      health,
      rulesCount: rules.length,
      languages,
      statistics
    });
    
    return { health, rules, languages, statistics };
  } catch (error) {
    console.error('Batch operations error:', error);
    throw error;
  }
}
