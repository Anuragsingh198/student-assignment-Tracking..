"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import { submissionApi } from "@/lib/api";

interface Submission {
  _id: string;
  id?: string;
  studentId: string | { _id: string; name: string; email: string };
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt: string;
  isLate: boolean;
  version: number;
  status: string;
  score?: number;
}

interface Assignment {
  _id: string;
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  allowedSubmissionType: 'TEXT' | 'FILE';
  maxScore: number;
  isPublished: boolean;
  createdAt: string;
  submissions: Submission[];
}

interface AssignmentsWithSubmissionsProps {
  role: 'teacher' | 'student';
}

export function AssignmentsWithSubmissions({ role }: AssignmentsWithSubmissionsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (role === 'teacher') {
          response = await submissionApi.getTeacherAssignmentsWithSubmissions();
        } else {
          response = await submissionApi.getStudentAssignmentsWithSubmissions();
        }

        const assignmentsData = response.assignments || [];
        
        const normalizedAssignments = assignmentsData.map((assignment: any) => ({
          ...assignment,
          id: assignment._id || assignment.id,
          submissions: (assignment.submissions || []).map((sub: any) => ({
            ...sub,
            id: sub._id || sub.id,
          })),
        }));

        setAssignments(normalizedAssignments);
        
        const assignmentsWithSubs = normalizedAssignments
          .filter((a: Assignment) => a.submissions.length > 0)
          .map((a: Assignment) => a.id || a._id);
        setExpandedAssignments(new Set(assignmentsWithSubs));
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load assignments");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  const toggleAssignment = (assignmentId: string) => {
    setExpandedAssignments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId);
      } else {
        newSet.add(assignmentId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (submission: Submission) => {
    if (submission.score !== undefined) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded: {submission.score}%
        </Badge>
      );
    }
    if (submission.status === 'EVALUATED') {
      return (
        <Badge variant="default">
          <CheckCircle className="w-3 h-3 mr-1" />
          Evaluated
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Submitted
      </Badge>
    );
  };

  const getStudentName = (submission: Submission): string => {
    if (typeof submission.studentId === 'object' && submission.studentId !== null) {
      return submission.studentId.name || 'Unknown Student';
    }
    return 'Unknown Student';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading assignments...</span>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {role === 'teacher' ? 'All Assignments & Submissions' : 'My Submissions'}
          </h2>
          <p className="text-muted-foreground">
            {role === 'teacher' 
              ? 'Review and evaluate student submissions grouped by assignment'
              : 'View your submissions grouped by assignment'}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {role === 'teacher' 
                  ? 'No assignments found. Create assignments to see submissions here.'
                  : 'No submissions yet. Submit assignments to see them here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const assignmentId = assignment.id || assignment._id;
            const isExpanded = expandedAssignments.has(assignmentId);
            const submissionCount = assignment.submissions.length;

            return (
              <Card key={assignmentId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        {!assignment.isPublished && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        <Badge variant="outline">
                          {assignment.allowedSubmissionType === 'TEXT' ? '📝 Text' : '📎 File'}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {assignment.description}
                      </CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span>Max Score: {assignment.maxScore}</span>
                        <span className="font-medium">
                          {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {submissionCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAssignment(assignmentId)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {isExpanded && submissionCount > 0 && (
                  <CardContent>
                    <div className="space-y-3 mt-4 border-t pt-4">
                      {assignment.submissions.map((submission) => {
                        const submissionId = submission.id || submission._id;
                        const studentName = getStudentName(submission);

                        return (
                          <Card key={submissionId} className="bg-muted/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">
                                      {role === 'teacher' ? studentName : 'Your Submission'}
                                    </span>
                                    {submission.isLate && (
                                      <Badge variant="destructive" className="text-xs">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Late
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      v{submission.version}
                                    </Badge>
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground">
                                    <p>
                                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                    </p>
                                  </div>

                                  {submission.content && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium mb-1">Content:</p>
                                      <div className="text-sm bg-background p-2 rounded border max-h-32 overflow-y-auto">
                                        {submission.content.length > 200 
                                          ? `${submission.content.substring(0, 200)}...`
                                          : submission.content}
                                      </div>
                                    </div>
                                  )}

                                  {submission.fileUrl && submission.fileName && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium mb-1">File:</p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <a 
                                          href={submission.fileUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center"
                                        >
                                          <Download className="w-4 h-4 mr-2" />
                                          {submission.fileName}
                                          {submission.fileSize && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                              ({(submission.fileSize / 1024).toFixed(1)} KB)
                                            </span>
                                          )}
                                        </a>
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col items-end space-y-2 ml-4">
                                  {getStatusBadge(submission)}
                                  {role === 'teacher' && (
                                    <Button size="sm" asChild>
                                      <Link href={`/teacher/submissions/${assignmentId}`}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Evaluate
                                      </Link>
                                    </Button>
                                  )}
                                  {role === 'student' && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={`/student/submit/${assignmentId}`}>
                                        View Details
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                )}

                {submissionCount === 0 && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {role === 'teacher' 
                        ? 'No submissions yet for this assignment.'
                        : 'You haven\'t submitted to this assignment yet.'}
                    </p>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

