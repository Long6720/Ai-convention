'use client';

import type React from 'react';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Code,
  GitPullRequest,
  FileText,
  Settings,
  History,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { aiCodeReviewService } from '@/services/api-service';
import { CodeEditor } from '@/components/ui/code-editor';

export default function CodeReviewDashboard() {
  const [codeSnippet, setCodeSnippet] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.py',
        '.java',
        '.cpp',
        '.c',
        '.go',
        '.rs',
      ];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (allowedTypes.includes(fileExtension)) {
        setSelectedFile(file);
        toast({
          title: 'File uploaded',
          description: `${file.name} is ready for review`,
        });
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a supported code file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleReview = async (type: 'snippet' | 'github' | 'file') => {
    setIsReviewing(true);

    try {
      const payload: any = { type };

      switch (type) {
        case 'snippet':
          if (!codeSnippet.trim()) {
            toast({
              title: 'No code provided',
              description: 'Please enter some code to review',
              variant: 'destructive',
            });
            return;
          }
          payload.code = codeSnippet;
          break;

        case 'github':
          if (!githubUrl.trim()) {
            toast({
              title: 'No GitHub URL provided',
              description: 'Please enter a GitHub PR URL',
              variant: 'destructive',
            });
            return;
          }
          payload.githubUrl = githubUrl;
          break;

        case 'file':
          if (!selectedFile) {
            toast({
              title: 'No file selected',
              description: 'Please select a file to review',
              variant: 'destructive',
            });
            return;
          }

          const fileContent = await selectedFile.text();
          payload.code = fileContent;
          payload.filename = selectedFile.name;
          break;
      }

      const response = await aiCodeReviewService.reviewCode({
        code: codeSnippet,
      });
      console.log(response);

      if (!response.success) {
        throw new Error("Review failed")
      }

      const result = response;

      // // Store result in sessionStorage and navigate to results page
      sessionStorage.setItem("reviewResult", JSON.stringify(result))
      router.push("/results")
    } catch (error) {
      toast({
        title: 'Review failed',
        description: 'An error occurred during the code review',
        variant: 'destructive',
      });
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                AI Code Reviewer
              </h1>
              <p className='text-gray-600'>
                Intelligent code analysis powered by AI
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => router.push('/rules')}
                className='flex items-center gap-2'
              >
                <Settings className='h-4 w-4' />
                Document Library
              </Button>
              <Button
                variant='outline'
                onClick={() => router.push('/history')}
                className='flex items-center gap-2'
              >
                <History className='h-4 w-4' />
                Review History
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  // Create a comprehensive demo result
                  const demoResult = {
                    id: 'demo-' + Date.now(),
                    timestamp: new Date().toISOString(),
                    type: 'snippet',
                    filename: 'user-authentication.js',
                    summary: {
                      score: 72,
                      totalIssues: 8,
                      criticalIssues: 2,
                      warnings: 4,
                      suggestions: 2,
                    },
                    issues: [
                      {
                        type: 'critical' as const,
                        title: 'SQL Injection Vulnerability',
                        description:
                          'Direct string concatenation in SQL query creates a potential SQL injection vulnerability. User input should always be parameterized.',
                        line: 23,
                        code: `const query = "SELECT * FROM users WHERE email = '" + userEmail + "' AND password = '" + password + "'";`,
                        suggestion: `const query = "SELECT * FROM users WHERE email = ? AND password = ?";
db.query(query, [userEmail, hashedPassword]);`,
                        rule: 'SQL Injection Prevention',
                      },
                      {
                        type: 'critical' as const,
                        title: 'Password Stored in Plain Text',
                        description:
                          'Passwords should never be stored or compared in plain text. Use proper hashing algorithms like bcrypt.',
                        line: 31,
                        code: `if (user.password === password) {
  return { success: true, user };
}`,
                        suggestion: `const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
if (isValidPassword) {
  return { success: true, user };
}`,
                        rule: 'Security Best Practices',
                      },
                      {
                        type: 'warning' as const,
                        title: 'Missing Error Handling',
                        description:
                          'Database operations should be wrapped in try-catch blocks to handle potential errors gracefully.',
                        line: 18,
                        code: `const result = await db.query(query);
return result.rows[0];`,
                        suggestion: `try {
  const result = await db.query(query);
  return result.rows[0];
} catch (error) {
  console.error('Database error:', error);
  throw new Error('Authentication failed');
}`,
                        rule: 'Error Handling',
                      },
                      {
                        type: 'warning' as const,
                        title: 'Console.log in Production Code',
                        description:
                          'Console.log statements should be removed from production code or replaced with proper logging.',
                        line: 12,
                        code: `console.log('User login attempt:', userEmail);`,
                        suggestion: `logger.info('User login attempt', { email: userEmail });`,
                        rule: 'No console.log in production',
                      },
                      {
                        type: 'warning' as const,
                        title: 'Hardcoded Configuration',
                        description:
                          'Database connection string should be stored in environment variables, not hardcoded.',
                        line: 5,
                        code: `const dbUrl = 'postgresql://user:pass@localhost:5432/mydb';`,
                        suggestion: `const dbUrl = process.env.DATABASE_URL;`,
                        rule: 'Configuration Management',
                      },
                      {
                        type: 'warning' as const,
                        title: 'Missing Input Validation',
                        description:
                          'User inputs should be validated before processing to prevent malicious data.',
                        line: 15,
                        code: `function authenticateUser(userEmail, password) {`,
                        suggestion: `function authenticateUser(userEmail, password) {
  if (!userEmail || !password) {
    throw new Error('Email and password are required');
  }
  if (!isValidEmail(userEmail)) {
    throw new Error('Invalid email format');
  }`,
                        rule: 'Input Validation',
                      },
                      {
                        type: 'suggestion' as const,
                        title: 'Consider Rate Limiting',
                        description:
                          'Authentication endpoints should implement rate limiting to prevent brute force attacks.',
                        suggestion:
                          'Implement rate limiting middleware to restrict login attempts per IP address.',
                        rule: 'Security Enhancement',
                      },
                      {
                        type: 'suggestion' as const,
                        title: 'Add JSDoc Comments',
                        description:
                          'Functions should have proper documentation describing parameters, return values, and behavior.',
                        line: 15,
                        code: `function authenticateUser(userEmail, password) {`,
                        suggestion: `/**
 * Authenticates a user with email and password
 * @param {string} userEmail - User's email address
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication result with user data
 */
function authenticateUser(userEmail, password) {`,
                        rule: 'Documentation Standards',
                      },
                    ],
                    positives: [
                      'Good use of async/await for database operations',
                      'Function names are descriptive and follow camelCase convention',
                      'Code structure is readable and well-organized',
                      'Proper separation of concerns between authentication logic',
                      'Uses modern JavaScript ES6+ features appropriately',
                    ],
                    recommendations: [
                      'Implement proper password hashing using bcrypt or similar library',
                      'Add comprehensive input validation and sanitization',
                      'Set up proper error handling and logging throughout the application',
                      'Use environment variables for all configuration values',
                      'Consider implementing JWT tokens for session management',
                      'Add unit tests for authentication functions',
                      'Implement rate limiting and account lockout mechanisms',
                      'Use a proper ORM or query builder to prevent SQL injection',
                      'Add monitoring and alerting for failed authentication attempts',
                    ],
                  };

                  sessionStorage.setItem(
                    'reviewResult',
                    JSON.stringify(demoResult)
                  );
                  router.push('/results');
                }}
                className='flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700'
              >
                <Eye className='h-4 w-4' />
                View Demo Results
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className='shadow-xl'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Code className='h-5 w-5' />
              Code Review Options
            </CardTitle>
            <CardDescription>
              Choose how you'd like to submit your code for AI-powered review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='snippet' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger
                  value='snippet'
                  className='flex items-center gap-2'
                >
                  <FileText className='h-4 w-4' />
                  Code Snippet
                </TabsTrigger>
                <TabsTrigger value='github' className='flex items-center gap-2'>
                  <GitPullRequest className='h-4 w-4' />
                  GitHub PR
                </TabsTrigger>
                <TabsTrigger value='file' className='flex items-center gap-2'>
                  <Upload className='h-4 w-4' />
                  File Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value='snippet' className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='code-snippet'>Paste your code here</Label>
                  <CodeEditor
                    value={codeSnippet}
                    onValueChange={(e) => setCodeSnippet(e)}
                    className='h-[300px] font-mono text-sm !overflow-auto border-1'
                  />
                </div>
                <Button
                  onClick={() => handleReview('snippet')}
                  disabled={isReviewing}
                  className='w-full'
                  size='lg'
                >
                  {isReviewing ? 'Reviewing...' : 'Review Code Snippet'}
                </Button>
              </TabsContent>

              <TabsContent value='github' className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='github-url'>GitHub Pull Request URL</Label>
                  <Input
                    id='github-url'
                    type='url'
                    placeholder='https://github.com/owner/repo/pull/123'
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                  <p className='text-sm text-gray-500'>
                    Enter the URL of a GitHub pull request to review all changes
                  </p>
                </div>
                <Button
                  onClick={() => handleReview('github')}
                  disabled={isReviewing}
                  className='w-full'
                  size='lg'
                >
                  {isReviewing ? 'Reviewing...' : 'Review GitHub PR'}
                </Button>
              </TabsContent>

              <TabsContent value='file' className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='file-upload'>Upload Code File</Label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors'>
                    <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-600'>
                        {selectedFile
                          ? selectedFile.name
                          : 'Click to upload or drag and drop'}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Supports: .js, .jsx, .ts, .tsx, .py, .java, .cpp, .c,
                        .go, .rs
                      </p>
                      <Input
                        id='file-upload'
                        type='file'
                        accept='.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.go,.rs'
                        onChange={handleFileUpload}
                        className='hidden'
                      />
                      <Button
                        variant='outline'
                        onClick={() =>
                          document.getElementById('file-upload')?.click()
                        }
                        type='button'
                      >
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleReview('file')}
                  disabled={isReviewing || !selectedFile}
                  className='w-full'
                  size='lg'
                >
                  {isReviewing ? 'Reviewing...' : 'Review Uploaded File'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className='grid md:grid-cols-3 gap-6 mt-8'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600'>
                AI-powered code analysis that understands context, patterns, and
                best practices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Document Library</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600'>
                Store and manage reference documents, coding standards, and
                style guides for AI-powered reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Multiple Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600'>
                Support for code snippets, GitHub PRs, and direct file uploads
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
