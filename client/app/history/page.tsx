"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar, FileText, GitPullRequest, Upload, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface HistoryItem {
  id: string
  timestamp: string
  type: "snippet" | "github" | "file"
  filename?: string
  githubUrl?: string
  score: number
  totalIssues: number
  criticalIssues: number
  summary: string
}

export default function ReviewHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "snippet" | "github" | "file">("all")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("codeReviewHistory")
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory)
      setHistory(parsedHistory)
      setFilteredHistory(parsedHistory)
    } else {
      // Mock data for demonstration
      const mockHistory: HistoryItem[] = [
        {
          id: "1",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          type: "file",
          filename: "auth.js",
          score: 75,
          totalIssues: 5,
          criticalIssues: 1,
          summary: "Found security vulnerability in authentication logic",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          type: "github",
          githubUrl: "https://github.com/example/repo/pull/123",
          score: 88,
          totalIssues: 3,
          criticalIssues: 0,
          summary: "Minor style issues and performance suggestions",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          type: "snippet",
          score: 92,
          totalIssues: 2,
          criticalIssues: 0,
          summary: "Clean code with minor optimization opportunities",
        },
      ]
      setHistory(mockHistory)
      setFilteredHistory(mockHistory)
      localStorage.setItem("codeReviewHistory", JSON.stringify(mockHistory))
    }
  }, [])

  useEffect(() => {
    let filtered = history

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((item) => item.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.githubUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredHistory(filtered)
  }, [history, searchTerm, filterType])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return <Upload className="h-4 w-4" />
      case "github":
        return <GitPullRequest className="h-4 w-4" />
      case "snippet":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50"
    if (score >= 60) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("codeReviewHistory", JSON.stringify(updatedHistory))
    toast({
      title: "Item deleted",
      description: "Review history item has been removed",
    })
  }

  const clearAllHistory = () => {
    setHistory([])
    setFilteredHistory([])
    localStorage.removeItem("codeReviewHistory")
    toast({
      title: "History cleared",
      description: "All review history has been removed",
    })
  }

  const viewResult = (item: HistoryItem) => {
    // Create a mock result object for viewing
    const mockResult = {
      id: item.id,
      timestamp: item.timestamp,
      type: item.type,
      filename: item.filename,
      summary: {
        score: item.score,
        totalIssues: item.totalIssues,
        criticalIssues: item.criticalIssues,
        warnings: item.totalIssues - item.criticalIssues,
        suggestions: Math.max(0, item.totalIssues - item.criticalIssues - 1),
      },
      issues: [
        {
          type: "warning" as const,
          title: "Sample Issue",
          description: item.summary,
          line: 42,
        },
      ],
      positives: ["Good code structure", "Proper error handling"],
      recommendations: ["Consider adding unit tests", "Optimize performance"],
    }

    sessionStorage.setItem("reviewResult", JSON.stringify(mockResult))
    router.push("/results")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/")} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Review History</h1>
                <p className="text-gray-600">View and manage your past code reviews</p>
              </div>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={clearAllHistory}
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by filename, URL, or summary..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={filterType === "snippet" ? "default" : "outline"}
                  onClick={() => setFilterType("snippet")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  Snippets
                </Button>
                <Button
                  variant={filterType === "github" ? "default" : "outline"}
                  onClick={() => setFilterType("github")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <GitPullRequest className="h-3 w-3" />
                  GitHub
                </Button>
                <Button
                  variant={filterType === "file" ? "default" : "outline"}
                  onClick={() => setFilterType("file")}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" />
                  Files
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {history.length === 0 ? "No Review History" : "No Results Found"}
              </h3>
              <p className="text-gray-600 mb-4">
                {history.length === 0
                  ? "Start reviewing code to see your history here"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {history.length === 0 && <Button onClick={() => router.push("/")}>Start First Review</Button>}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <Badge variant="outline" className="capitalize">
                            {item.type}
                          </Badge>
                        </div>
                        {item.filename && <span className="font-medium text-gray-900">{item.filename}</span>}
                        {item.githubUrl && (
                          <span className="font-medium text-gray-900 truncate max-w-md">{item.githubUrl}</span>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-3">{item.summary}</p>

                      <div className="flex items-center gap-4">
                        <div className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(item.score)}`}>
                          Score: {item.score}/100
                        </div>
                        <div className="text-sm text-gray-600">{item.totalIssues} issues found</div>
                        {item.criticalIssues > 0 && <Badge variant="destructive">{item.criticalIssues} critical</Badge>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewResult(item)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {history.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{history.length}</div>
                  <div className="text-sm text-gray-600">Total Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(history.reduce((acc, item) => acc + item.score, 0) / history.length)}
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {history.reduce((acc, item) => acc + item.totalIssues, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {history.reduce((acc, item) => acc + item.criticalIssues, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
