'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CodeEditor } from '@/components/ui/code-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { aiCodeReviewService } from '@/services/api-service';
import {
  Code,
  Eye,
  FileText,
  GitPullRequest,
  History,
  Settings,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
        '.md'
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
    let result = null;

    try {
      const payload: any = { type };
      let response: any = null;

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
          response = await aiCodeReviewService.reviewCode({
            code: codeSnippet,
          });
          ;
    
          if (!response.success) {
            throw new Error("Review failed")
          }
    
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
          response = await aiCodeReviewService.reviewGitHubPR({
            pr_url: githubUrl,
          });
    
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

      if (!response.success) {
        throw new Error("Review failed")
      }

      result = response;

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
              {/* <Button
                variant='outline'
                onClick={() => router.push('/history')}
                className='flex items-center gap-2'
              >
                <History className='h-4 w-4' />
                Review History
              </Button> */}
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
              <TabsList className='grid w-full grid-cols-2'>
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
                {/* <TabsTrigger value='file' className='flex items-center gap-2'>
                  <Upload className='h-4 w-4' />
                  File Upload
                </TabsTrigger> */}
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
