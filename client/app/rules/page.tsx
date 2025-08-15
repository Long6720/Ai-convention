'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  type File,
  Download,
  Trash2,
  Eye,
  Search,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { aiCodeReviewService, deleteRuleById } from '@/services/api-service';

interface DocumentFile {
  id: string;
  name: string;
  originalName: string;
  // type?: string
  // size?: number
  // category?: "standards" | "guidelines" | "examples" | "templates" | "other"
  description?: string;
  // uploadedAt?: string
  content?: string;
  chunk_ids: string[];
  // url?: string
}

const documentCategories = [
  { value: 'standards', label: 'Coding Standards', icon: '📋' },
  { value: 'guidelines', label: 'Style Guidelines', icon: '🎨' },
  { value: 'examples', label: 'Code Examples', icon: '💡' },
  { value: 'templates', label: 'Templates', icon: '📄' },
  { value: 'other', label: 'Other', icon: '📁' },
];

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentFile[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [newDocDescription, setNewDocDescription] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  // const [newDocCategory, setNewDocCategory] =
  //   useState<DocumentFile['category']>('standards');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentFile | null>(
    null
  );
  const router = useRouter();
  const { toast } = useToast();

  // useEffect(() => {
  //   // Load documents from localStorage
  //   const savedDocuments = localStorage.getItem("codeReviewDocuments")
  //   if (savedDocuments) {
  //     const parsedDocs = JSON.parse(savedDocuments)
  //     setDocuments(parsedDocs)
  //     setFilteredDocuments(parsedDocs)
  //   } else {
  //     // Add some sample documents
  //     const sampleDocs: DocumentFile[] = [
  //       {
  //         id: "1",
  //         name: "javascript-style-guide.pdf",
  //         originalName: "JavaScript Style Guide.pdf",
  //         type: "application/pdf",
  //         size: 245760,
  //         category: "guidelines",
  //         description: "Comprehensive JavaScript coding style guide with best practices",
  //         uploadedAt: new Date(Date.now() - 86400000).toISOString(),
  //         content: "Sample JavaScript style guide content...",
  //       },
  //       {
  //         id: "2",
  //         name: "security-checklist.md",
  //         originalName: "Security Checklist.md",
  //         type: "text/markdown",
  //         size: 12800,
  //         category: "standards",
  //         description: "Security review checklist for code reviews",
  //         uploadedAt: new Date(Date.now() - 172800000).toISOString(),
  //         content:
  //           "# Security Checklist\n\n- [ ] Input validation\n- [ ] SQL injection prevention\n- [ ] XSS protection",
  //       },
  //     ]
  //     setDocuments(sampleDocs)
  //     setFilteredDocuments(sampleDocs)
  //     localStorage.setItem("codeReviewDocuments", JSON.stringify(sampleDocs))
  //   }
  // }, [])

  const fetchRules = async () => {
    const response = await aiCodeReviewService.getRules();

    const docs: DocumentFile[] = response.rules.map((rule) => ({
      id: rule.first_chunk_id,
      name: rule.rule_name,
      originalName: rule.rule_name,
      content: rule.content,
      description: rule.description,
      chunk_ids: rule.chunk_ids,
    }));
    console.log(response);
    setDocuments(docs);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    let filtered = documents;

    // Filter by category
    // if (selectedCategory !== 'all') {
    //   filtered = filtered.filter((doc) => doc.category === selectedCategory);
    // }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedCategory]);

  const saveDocuments = (updatedDocs: DocumentFile[]) => {
    setDocuments(updatedDocs);
    localStorage.setItem('codeReviewDocuments', JSON.stringify(updatedDocs));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }
    console.log(file);
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/html',
      'application/json',
    ];

    // if (!allowedTypes.includes(file.type)) {
    //   toast({
    //     title: "Unsupported file type",
    //     description: "Please upload PDF, Word, text, markdown, HTML, or JSON files",
    //     variant: "destructive",
    //   })
    //   return
    // }

    setUploadingFile(file);
    setShowUploadForm(true);
  };

  const uploadDocument = async () => {
    newRuleName;
    if (!uploadingFile || !newRuleName.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a rule name for the document',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Read file content for text files

      // const newDocument: DocumentFile = {
      //   id: Date.now().toString(),
      //   name: newRuleName,
      //   originalName: uploadingFile.name,
      //   // type: uploadingFile.type,
      //   // size: uploadingFile.size,
      //   // category: newDocCategory,
      //   description: newDocDescription,
      //   // uploadedAt: new Date().toISOString(),
      //   content: content || undefined,
      //   // url: content ? undefined : URL.createObjectURL(uploadingFile),
      // };

      await aiCodeReviewService.uploadRulesFile(
        uploadingFile,
        newRuleName,
        newDocDescription
      );

      fetchRules();

      // Reset form
      setUploadingFile(null);
      setNewDocDescription('');
      setNewRuleName('');
      // setNewDocCategory('standards');
      setShowUploadForm(false);

      toast({
        title: 'Document uploaded',
        description: 'Document has been added successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    }
  };

  const deleteDocument = async (id: string) => {
    const deletedDocument = documents.find((doc) => doc.id === id);
    const updatedDocuments = documents.filter((doc) => doc.id !== id);
    if (deletedDocument) {
      await aiCodeReviewService.deleteRulesByIds(deletedDocument.chunk_ids);
    }
    // saveDocuments(updatedDocuments);
    fetchRules();
    toast({
      title: 'Document deleted',
      description: 'Document has been removed',
    });
  };

  const previewDoc = (doc: DocumentFile) => {
    setPreviewDocument(doc);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return '📄';
    if (type.startsWith('text/')) return '📝';
    if (type.includes('word')) return '📘';
    if (type === 'application/json') return '🔧';
    return '📁';
  };

  const exportAllDocuments = () => {
    const exportData = {
      documents: documents.map((doc) => ({
        ...doc,
        url: undefined, // Don't export blob URLs
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-review-documents.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Documents exported',
      description: 'Document metadata has been exported',
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='outline'
                onClick={() => router.push('/')}
                className='flex items-center gap-2'
              >
                <ArrowLeft className='h-4 w-4' />
                Back to Dashboard
              </Button>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  Document Library
                </h1>
                <p className='text-gray-600'>
                  Manage reference documents for code reviews
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              {/* <Button variant='outline' onClick={exportAllDocuments}>
                <Download className='h-4 w-4 mr-2' />
                Export All
              </Button> */}
              <div>
                <input
                  type='file'
                  accept='.pdf,.doc,.docx,.txt,.md,.html,.json'
                  onChange={handleFileUpload}
                  className='hidden'
                  id='file-upload'
                />
                <Button
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  <Upload className='h-4 w-4 mr-2' />
                  Upload Document
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && uploadingFile && (
          <Card className='mb-6 border-2 border-blue-200'>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Add details for: {uploadingFile.name}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {/* <div>
                  <Label>Category</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={newDocCategory}
                    // onChange={(e) => setNewDocCategory(e.target.value as DocumentFile["category"])}
                  >
                    {documentCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div> */}
                <div>
                  <Label>File Size</Label>
                  <div className='p-2 bg-gray-50 rounded text-sm text-gray-600'>
                    {formatFileSize(uploadingFile.size)}
                  </div>
                </div>
              </div>
              <div>
                <label>Rule name</label>
                <Input
                  placeholder='Input Rule name'
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                ></Input>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder='Describe what this document contains and how it should be used in code reviews...'
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                />
              </div>
              <div className='flex gap-2'>
                <Button onClick={uploadDocument}>
                  <Upload className='h-4 w-4 mr-2' />
                  Upload Document
                </Button>
                <Button
                  variant='outline'
                  onClick={() => setShowUploadForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        {/* <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search documents by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  onClick={() => setSelectedCategory("all")}
                  size="sm"
                >
                  All ({documents.length})
                </Button>
                
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className='text-center py-12'>
              <FolderOpen className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {documents.length === 0
                  ? 'No Documents Yet'
                  : 'No Results Found'}
              </h3>
              <p className='text-gray-600 mb-4'>
                {documents.length === 0
                  ? 'Upload your first document to get started'
                  : 'Try adjusting your search or filter criteria'}
              </p>
              {documents.length === 0 && (
                <Button
                  onClick={() =>
                    document.getElementById('file-upload')?.click()
                  }
                >
                  <Upload className='h-4 w-4 mr-2' />
                  Upload First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-2'>
                      {/* <span className="text-2xl">{getFileIcon(doc.type)}</span> */}
                      <div className='flex-1 min-w-0'>
                        <h3
                          className='font-semibold text-sm truncate'
                          title={doc.originalName}
                        >
                          {doc.originalName}
                        </h3>
                        <div className='flex items-center gap-2 mt-1'></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                    {doc.description}
                  </p>

                  {/* <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                      <div>{formatFileSize(doc.size)}</div>
                    </div> */}

                  <div className='flex gap-2'>
                    {doc.content && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => previewDoc(doc)}
                        className='flex-1'
                      >
                        <Eye className='h-3 w-3 mr-1' />
                        Preview
                      </Button>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => deleteDocument(doc.id)}
                      className='text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewDocument && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <Card className='max-w-4xl max-h-[80vh] w-full'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>{previewDocument.originalName}</CardTitle>
                  <Button
                    variant='ghost'
                    onClick={() => setPreviewDocument(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='max-h-[60vh] overflow-auto'>
                <pre className='whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded'>
                  {previewDocument.content}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistics */}
        {documents.length > 0 && (
          <Card className='mt-8'>
            <CardHeader>
              <CardTitle>Library Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-2 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {documents.length}
                  </div>
                  <div className='text-sm text-gray-600'>Total Documents</div>
                </div>

                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>
                    {documents.filter((doc) => doc.content).length}
                  </div>
                  <div className='text-sm text-gray-600'>Previewable</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
