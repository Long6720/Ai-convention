import { 
  aiCodeReviewService, 
  reviewCode, 
  getRules, 
  healthCheck,
  type CodeReviewRequest,
  uploadRules,
  searchRules,
  getRuleByName,
  deleteRulesByName
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

// Example 9: Delete rule by ID
export async function exampleDeleteRuleById(ruleId: string) {
  try {
    console.log(`Attempting to delete rule with ID: ${ruleId}`);
    
    const result = await aiCodeReviewService.deleteRuleById(ruleId);
    
    if (result.success) {
      console.log('✅ Rule deleted successfully:', result.message);
      console.log('Deleted rule ID:', result.rule_id);
    } else {
      console.log('❌ Failed to delete rule:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting rule by ID:', error);
    throw error;
  }
}

// Example 10: Delete rules by name
export async function exampleDeleteRulesByName(ruleName: string) {
  try {
    console.log(`Attempting to delete all chunks of rule: ${ruleName}`);
    
    const result = await aiCodeReviewService.deleteRulesByName(ruleName);
    
    if (result.success) {
      console.log('✅ Rules deleted successfully:', result.message);
      console.log('Deleted rule name:', result.rule_name);
    } else {
      console.log('❌ Failed to delete rules:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting rules by name:', error);
    throw error;
  }
}

// Example 11: Rule management workflow
export async function exampleRuleManagementWorkflow() {
  try {
    console.log('🔄 Starting rule management workflow...');
    
    // 1. Get all current rules
    console.log('\n📋 Step 1: Getting current rules...');
    const currentRules = await getRules();
    console.log(`Found ${currentRules.rules?.length || 0} rules`);
    
    // 2. Upload a new rule
    console.log('\n📤 Step 2: Uploading a new rule...');
    const newRule = `# Test Rule
This is a test rule for demonstration purposes.
- Always use meaningful variable names
- Keep functions small and focused`;
    
    const uploadResult = await uploadRules(newRule, 'Test Rule', 'A test rule for demonstration');
    console.log('Upload result:', uploadResult.message);
    
    // 3. Search for the new rule
    console.log('\n🔍 Step 3: Searching for the new rule...');
    const searchResult = await searchRules('Test Rule', 5);
    console.log(`Found ${searchResult.rules?.length || 0} matching rules`);
    
    // 4. Delete the rule by name (this will delete all chunks)
    console.log('\n🗑️  Step 4: Deleting the test rule...');
    const deleteResult = await deleteRulesByName('Test Rule');
    console.log('Delete result:', deleteResult.message);
    
    // 5. Verify deletion
    console.log('\n✅ Step 5: Verifying deletion...');
    const finalRules = await getRules();
    console.log(`Final rule count: ${finalRules.rules?.length || 0}`);
    
    console.log('\n🎉 Rule management workflow completed successfully!');
    
    return {
      initialCount: currentRules.rules?.length || 0,
      finalCount: finalRules.rules?.length || 0,
      uploadResult,
      deleteResult
    };
    
  } catch (error) {
    console.error('❌ Rule management workflow failed:', error);
    throw error;
  }
}

// Example 12: Working with combined rule content
export async function exampleCombinedRuleContent() {
  try {
    console.log('📖 Demonstrating combined rule content functionality...');
    
    // 1. Get all rules with combined content
    console.log('\n📋 Step 1: Getting all rules with combined content...');
    const allRules = await getRules();
    
    if (allRules.rules && allRules.rules.length > 0) {
      console.log(`Found ${allRules.rules.length} rules with combined content:`);
      
      allRules.rules.forEach((rule, index) => {
        console.log(`\n--- Rule ${index + 1}: ${rule.rule_name} ---`);
        console.log(`Description: ${rule.description}`);
        console.log(`Total chunks: ${rule.total_chunks}`);
        console.log(`Content preview: ${rule.content.substring(0, 100)}...`);
        console.log(`First chunk ID: ${rule.first_chunk_id}`);
      });
    }
    
    // 2. Get a specific rule by name
    if (allRules.rules && allRules.rules.length > 0) {
      const firstRuleName = allRules.rules[0].rule_name;
      console.log(`\n🔍 Step 2: Getting specific rule: ${firstRuleName}`);
      
      const specificRule = await getRuleByName(firstRuleName);
      
      if (specificRule.success && specificRule.rule) {
        console.log('✅ Retrieved specific rule successfully:');
        console.log(`Rule name: ${specificRule.rule.rule_name}`);
        console.log(`Description: ${specificRule.rule.description}`);
        console.log(`Total chunks: ${specificRule.rule.total_chunks}`);
        console.log(`Content length: ${specificRule.rule.content.length} characters`);
        console.log(`Chunk IDs: ${specificRule.rule.chunk_ids.join(', ')}`);
        
        // Show a sample of the combined content
        console.log('\n📝 Combined content sample:');
        console.log(specificRule.rule.content.substring(0, 200) + '...');
      } else {
        console.log('❌ Failed to retrieve specific rule:', specificRule.message);
      }
    }
    
    // 3. Search rules and see combined content
    console.log('\n🔍 Step 3: Searching rules with combined content...');
    const searchResult = await searchRules('python', 3);
    
    if (searchResult.rules && searchResult.rules.length > 0) {
      console.log(`Found ${searchResult.rules.length} rules matching 'python':`);
      
      searchResult.rules.forEach((rule, index) => {
        console.log(`\n--- Search Result ${index + 1}: ${rule.rule_name} ---`);
        console.log(`Description: ${rule.description}`);
        console.log(`Relevance score: ${rule.relevance_score?.toFixed(3) || 'N/A'}`);
        console.log(`Content preview: ${rule.content.substring(0, 150)}...`);
      });
    }
    
    console.log('\n🎉 Combined rule content demonstration completed!');
    
    return {
      totalRules: allRules.rules?.length || 0,
      searchResults: searchResult.rules?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Combined rule content demonstration failed:', error);
    throw error;
  }
}
