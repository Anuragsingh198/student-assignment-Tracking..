"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Star, Bot, Save, Loader2, AlertCircle } from "lucide-react";
import { submissionApi, evaluationApi } from "@/lib/api";

interface SubmissionEvaluationProps {
  assignmentId: string;
}

interface Submission {
  id: string;
  content: string;
  status: string;
  submittedAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  files?: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
  score?: number;
}

export function SubmissionEvaluation({ assignmentId }: SubmissionEvaluationProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await submissionApi.getAll(assignmentId);
        const submissionsData = response.submissions || [];
        
        const transformedSubmissions = submissionsData.map((sub: any) => {
          const studentId = typeof sub.studentId === 'object' ? sub.studentId : null;
          
          return {
            id: sub._id || sub.id,
            content: sub.content || '',
            status: sub.status === 'EVALUATED' ? 'graded' : sub.status?.toLowerCase() || 'submitted',
            submittedAt: sub.submittedAt || new Date().toISOString(),
            student: {
              id: studentId?._id || studentId?.id || sub.studentId || '',
              name: studentId?.name || 'Unknown Student',
              email: studentId?.email || '',
            },
            files: sub.fileUrl ? [{
              id: sub._id || sub.id,
              filename: sub.fileName || 'file',
              url: sub.fileUrl,
            }] : [],
            score: sub.score,
          };
        });
        
        setSubmissions(transformedSubmissions);
        if (transformedSubmissions.length > 0) {
          setSelectedSubmissionId(transformedSubmissions[0].id);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load submissions");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  const selectedSubmission = submissions.find(sub => sub.id === selectedSubmissionId);

  useEffect(() => {
    if (selectedSubmission) {
      if (selectedSubmission.score !== undefined) {
        setScore(selectedSubmission.score.toString());
      } else {
        setScore("");
      }
      setFeedback("");
    }
  }, [selectedSubmissionId, selectedSubmission]);

  const handleSaveEvaluation = async () => {
    if (!selectedSubmission || !score) return;

    setIsEvaluating(true);
    setError("");

    try {
      await evaluationApi.evaluate(selectedSubmission.id, {
        score: parseInt(score),
        feedback,
      });

      const response = await submissionApi.getAll(assignmentId);
      const submissionsData = response.submissions || [];
      
      const transformedSubmissions = submissionsData.map((sub: any) => {
        const studentId = typeof sub.studentId === 'object' ? sub.studentId : null;
        
        return {
          id: sub._id || sub.id,
          content: sub.content || '',
          status: sub.status === 'EVALUATED' ? 'graded' : sub.status?.toLowerCase() || 'submitted',
          submittedAt: sub.submittedAt || new Date().toISOString(),
          student: {
            id: studentId?._id || studentId?.id || sub.studentId || '',
            name: studentId?.name || 'Unknown Student',
            email: studentId?.email || '',
          },
          files: sub.fileUrl ? [{
            id: sub._id || sub.id,
            filename: sub.fileName || 'file',
            url: sub.fileUrl,
          }] : [],
          score: sub.score,
        };
      });
      
      setSubmissions(transformedSubmissions);

      setScore("");
      setFeedback("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save evaluation");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && submissions.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  const applyAiSuggestion = (suggestion: string) => {
    setFeedback(prev => prev ? `${prev}\n\n${suggestion}` : suggestion);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Evaluate Submissions</h2>
          <p className="text-muted-foreground">
            Review and provide feedback for student submissions
          </p>
        </div>
        <Badge variant="secondary">
          {submissions.length} submissions
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No submissions yet for this assignment.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Submission Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubmissionId === submission.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedSubmissionId(submission.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{submission.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {submission.score !== undefined && (
                          <Badge variant="outline">
                            Score: {submission.score}
                          </Badge>
                        )}
                        <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                          {submission.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedSubmission && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Submission Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Submission Content</CardTitle>
                  <CardDescription>
                    Review {selectedSubmission.student.name}'s work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedSubmission.content && (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap break-words">{selectedSubmission.content}</div>
                      </div>
                    )}
                    {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Attachments:</p>
                        {selectedSubmission.files.map((file) => (
                          <Button key={file.id} variant="outline" size="sm" asChild>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                              Download {file.filename}
                            </a>
                          </Button>
                        ))}
                      </div>
                    )}
                    {!selectedSubmission.content && (!selectedSubmission.files || selectedSubmission.files.length === 0) && (
                      <p className="text-muted-foreground">No content or files submitted.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Evaluation Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation</CardTitle>
                  <CardDescription>
                    Provide score and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="score">Score (0-100)</Label>
                    {selectedSubmission.status === "graded" && selectedSubmission.score !== undefined ? (
                      <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-700 font-medium">Score: {selectedSubmission.score}</p>
                      </div>
                    ) : (
                      <Input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        placeholder="Enter score"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide detailed feedback..."
                      rows={6}
                      disabled={selectedSubmission.status === "graded"}
                    />
                  </div>

                  <Button
                    onClick={handleSaveEvaluation}
                    className="w-full"
                    disabled={isEvaluating || !score || selectedSubmission.status === "graded"}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Evaluation
                      </>
                    )}
                  </Button>

                  {selectedSubmission.status === "graded" && (
                    <p className="text-sm text-green-600 text-center">
                      This submission has already been graded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
