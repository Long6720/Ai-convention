"use client";

import { JSX, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Copy,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface ReviewResult {
  id: string;
  timestamp: string;
  type: string;
  filename?: string;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  overall_score: number;
  summary: {
    score: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
    suggestions: number;
  };
  review_results?: Array<{
    type: "critical" | "warning" | "suggestion" | "info";
    title?: string;
    description: string;
    lineNumber?: number;
    code?: string;
    suggestion?: string;
    rule?: string;
  }>;
  positive_aspects?: string[];
  recommendations?: string[];
}

export default function ReviewResults() {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  console.log("result: ", result);

  useEffect(() => {
    const storedResult = sessionStorage.getItem("reviewResult");
    if (storedResult) {
      try {
        setResult(JSON.parse(storedResult));
      } catch {
        console.error("Invalid stored review result");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const getIssueIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      critical: <XCircle className="h-4 w-4 text-red-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      suggestion: <Info className="h-4 w-4 text-blue-500" />,
    };
    return icons[type] ?? <Info className="h-4 w-4 text-gray-500" />;
  };

  const getIssueColor = (type: string) =>
    type === "critical"
      ? "destructive"
      : type === "warning"
      ? "secondary"
      : "outline";

  const getScoreColor = (score: number) =>
    score >= 80
      ? "text-green-600"
      : score >= 60
      ? "text-yellow-600"
      : "text-red-600";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard",
    });
  };

  const exportReport = () => {
    if (!result) return;

    const reportData = { ...result, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `code-review-${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);

    toast({
      title: "Report exported",
      description: "The review report has been downloaded",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading review results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>
              No review results were found. Please start a new review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Start New Review
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const issues = result.review_results ?? [];
  const positives = result.positive_aspects ?? [];
  const recs = result.recommendations ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Review Results
              </h1>
              <p className="text-gray-600">{new Date().toLocaleString()}</p>
            </div>
          </div>
          {/* <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button> */}
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "Overall Score",
              value: `${result.overall_score || 0}/100`,
              color: getScoreColor(result.overall_score),
            },
            {
              title: "Total Issues",
              value: result.total_issues,
              color: "text-gray-900",
            },
            {
              title: "Critical Issues",
              value: result.critical_count,
              color: "text-red-600",
            },
            {
              title: "Warnings",
              value: result.warning_count,
              color: "text-yellow-600",
            },
          ].map((item, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Issues */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Issues Found</CardTitle>
                <CardDescription>
                  Detailed analysis of potential problems in your code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">No issues found! Great job!</p>
                  </div>
                ) : (
                  issues.map((issue, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getIssueIcon(issue.type)}
                          <h3 className="font-semibold">{issue.title}</h3>
                          <Badge variant={getIssueColor(issue.type) as any}>
                            {issue.type}
                          </Badge>
                        </div>
                        {issue.lineNumber && (
                          <Badge variant="outline">
                            Line {issue.lineNumber}
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-700">{issue.description}</p>

                      {issue.code && (
                        <div className="bg-gray-100 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">
                              CODE
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(issue.code!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                            {issue.code}
                          </pre>
                        </div>
                      )}

                      {issue.suggestion && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-green-700">
                              SUGGESTION
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(issue.suggestion!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-green-800">
                            {issue.suggestion}
                          </p>
                        </div>
                      )}

                      {issue.rule && (
                        <div className="text-xs text-gray-500">
                          Rule: {issue.rule}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {positives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" /> What's
                    Good
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {positives.map((positive, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {positive}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {recs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {recs.map((rec, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/")}
                >
                  Review More Code
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/rules")}
                >
                  Manage Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/history")}
                >
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
