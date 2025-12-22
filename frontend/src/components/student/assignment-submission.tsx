"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Send, Clock, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { assignmentApi, submissionApi } from "@/lib/api";

interface AssignmentSubmissionProps {
  assignmentId: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  allowedSubmissionType: 'TEXT' | 'FILE';
}

interface Submission {
  id: string;
  content: string;
  status: string;
  grade?: number;
  feedback?: string;
  submittedAt: string;
  fileUrl?: string;
  fileName?: string;
}

export function AssignmentSubmission({ assignmentId }: AssignmentSubmissionProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAssignmentAndSubmission = async () => {
      try {
        const assignmentResponse = await assignmentApi.getById(assignmentId);
        const assignmentData = assignmentResponse.assignment;
        
        if (assignmentData) {
          if (!assignmentData.id && assignmentData._id) {
            assignmentData.id = assignmentData._id;
          }
          setAssignment(assignmentData);
        } else {
          throw new Error('Assignment not found');
        }

        const submissionsResponse = await submissionApi.getMySubmissions();
        const submissions = submissionsResponse?.submissions || [];
        const userSubmission = submissions.find(
          (sub: any) => {
            const subAssignmentId = typeof sub.assignmentId === 'object' 
              ? sub.assignmentId?._id || sub.assignmentId?.id 
              : sub.assignmentId;
            return subAssignmentId === assignmentId || subAssignmentId?.toString() === assignmentId;
          }
        );

        if (userSubmission) {
          setExistingSubmission({
            id: userSubmission._id || userSubmission.id,
            content: userSubmission.content || "",
            status: userSubmission.status || 'SUBMITTED',
            grade: userSubmission.score,
            submittedAt: userSubmission.submittedAt || new Date().toISOString(),
            fileUrl: userSubmission.fileUrl,
            fileName: userSubmission.fileName,
            feedback: userSubmission.feedback,
          });
          setContent(userSubmission.content || "");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAndSubmission();
  }, [assignmentId]);

  const isLate = assignment ? new Date() > new Date(assignment.dueDate) : false;
  const isAlreadySubmitted = !!existingSubmission;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async () => {
    if (!assignment) return;

    setIsSubmitting(true);
    setError("");

    try {
      const assignmentId = assignment._id || assignment.id;
      const response = await submissionApi.create({
        assignmentId: assignmentId || '',
        content,
        files: files.length > 0 ? files : undefined,
      });

      const submissionData = response?.data || response;
      
      if (submissionData) {
        setExistingSubmission({
          id: submissionData._id || submissionData.id,
          content: submissionData.content || content,
          status: submissionData.status || 'SUBMITTED',
          grade: submissionData.score,
          submittedAt: submissionData.submittedAt || new Date().toISOString(),
          fileUrl: submissionData.fileUrl,
          fileName: submissionData.fileName,
        });
        
        if (assignment.allowedSubmissionType === 'FILE') {
        } else {
          setContent(submissionData.content || content);
        }
      }

      const submissionsResponse = await submissionApi.getMySubmissions();
      const submissions = submissionsResponse?.submissions || [];
      const userSubmission = submissions.find(
        (sub: any) => {
          const subAssignmentId = typeof sub.assignmentId === 'object' 
            ? sub.assignmentId?._id || sub.assignmentId?.id 
            : sub.assignmentId;
          return subAssignmentId?.toString() === assignmentId?.toString();
        }
      );

      if (userSubmission) {
        setExistingSubmission({
          id: userSubmission._id || userSubmission.id,
          content: userSubmission.content || "",
          status: userSubmission.status || 'SUBMITTED',
          grade: userSubmission.score,
          submittedAt: userSubmission.submittedAt || new Date().toISOString(),
          fileUrl: userSubmission.fileUrl,
          fileName: userSubmission.fileName,
        });
      }

      setFiles([]);
      setContent("");
      
      setError("");
      setSuccessMessage("Assignment submitted successfully!");
      
      setTimeout(() => {
        router.push('/student/assignments');
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !assignment) {
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

  if (!assignment) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Assignment not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-muted-foreground">{assignment.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isAlreadySubmitted && (
            <Badge variant="default">
              <CheckCircle className="w-3 h-3 mr-1" />
              Already Submitted
            </Badge>
          )}
          {isLate && !isAlreadySubmitted && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Late Submission
            </Badge>
          )}
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Due {new Date(assignment.dueDate).toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {isAlreadySubmitted && existingSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Submitted:</strong> {new Date(existingSubmission.submittedAt).toLocaleString()}</p>
              {existingSubmission.grade !== undefined && (
                <p><strong>Grade:</strong> {existingSubmission.grade}%</p>
              )}
              {existingSubmission.fileUrl && existingSubmission.fileName && (
                <div>
                  <strong>Submitted File:</strong>
                  <p className="mt-1">
                    <a 
                      href={existingSubmission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {existingSubmission.fileName}
                    </a>
                  </p>
                </div>
              )}
              {existingSubmission.content && assignment?.allowedSubmissionType === 'TEXT' && (
                <div>
                  <strong>Content:</strong>
                  <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{existingSubmission.content}</p>
                </div>
              )}
              {existingSubmission.content && assignment?.allowedSubmissionType === 'FILE' && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{existingSubmission.content}</p>
                </div>
              )}
              {existingSubmission.feedback && (
                <div>
                  <strong>Feedback:</strong>
                  <p className="mt-1 text-muted-foreground">{existingSubmission.feedback}</p>
                </div>
              )}
              <p><strong>Status:</strong> {existingSubmission.status}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isAlreadySubmitted && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Work</CardTitle>
            <CardDescription>
              Provide your answer and optionally upload supporting files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {successMessage}
              </div>
            )}

            {assignment?.allowedSubmissionType === 'TEXT' && (
              <div className="space-y-2">
                <Label htmlFor="content">Your Answer</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your answer here..."
                  rows={8}
                  required
                />
              </div>
            )}

            {assignment?.allowedSubmissionType === 'FILE' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="files">Upload File *</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="files"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <span className="text-sm text-muted-foreground">
                      Max 10MB
                    </span>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Selected file:</p>
                      {files.map((file, index) => (
                        <p key={index} className="text-sm text-green-600">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Description (Optional)</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add any notes or description about your submission..."
                    rows={4}
                  />
                </div>
              </>
            )}

            {assignment && assignment.allowedSubmissionType !== 'TEXT' && assignment.allowedSubmissionType !== 'FILE' && (
              <div className="space-y-2">
                <Label htmlFor="content">Your Answer</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your answer here..."
                  rows={8}
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (assignment?.allowedSubmissionType === 'TEXT' && !content.trim()) || (assignment?.allowedSubmissionType === 'FILE' && files.length === 0)}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Assignment
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
