"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { assignmentApi, submissionApi } from "@/lib/api";

interface Assignment {
  _id?: string;
  id?: string;
  title: string;
  dueDate: string;
  isPublished: boolean;
}

interface Submission {
  assignmentId: string | { _id: string };
  status: string;
}

export function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    totalSubmissions: 0,
    pendingEvaluations: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState<Array<{
    id: string;
    title: string;
    dueDate: string;
    submissions: number;
    totalStudents: number;
    status: string;
  }>>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [assignmentsResponse, submissionsResponse] = await Promise.all([
          assignmentApi.getAll(),
          submissionApi.getAll(),
        ]);

        const assignments = assignmentsResponse.assignments || [];
        const submissions = submissionsResponse.submissions || [];

        const totalAssignments = assignments.length;
        const activeAssignments = assignments.filter((a: Assignment) => a.isPublished).length;
        const totalSubmissions = submissions.length;
        const pendingEvaluations = submissions.filter((s: Submission) => s.status === 'SUBMITTED').length;

        setStats({
          totalAssignments,
          activeAssignments,
          totalSubmissions,
          pendingEvaluations,
        });

        const assignmentSubmissionCounts = new Map<string, number>();
        submissions.forEach((sub: Submission) => {
          const assignmentId = typeof sub.assignmentId === 'object' 
            ? sub.assignmentId?._id || sub.assignmentId?.id 
            : sub.assignmentId;
          const id = assignmentId?.toString() || '';
          assignmentSubmissionCounts.set(id, (assignmentSubmissionCounts.get(id) || 0) + 1);
        });

        const recent = assignments
          .map((assignment: Assignment) => {
            const assignmentId = assignment._id || assignment.id || '';
            const submissionCount = assignmentSubmissionCounts.get(assignmentId.toString()) || 0;
            const dueDate = new Date(assignment.dueDate);
            const now = new Date();
            const status = dueDate > now && assignment.isPublished ? "active" : "completed";

            return {
              id: assignmentId.toString(),
              title: assignment.title,
              dueDate: assignment.dueDate,
              submissions: submissionCount,
              totalStudents: 30, // This would ideally come from enrollment data
              status,
            };
          })
          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
          .slice(0, 5); // Show top 5 recent

        setRecentAssignments(recent);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your assignments and submissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAssignments} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalAssignments} assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              Need your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Above average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>
                Your latest assignments and their submission status
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/teacher/assignments">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <h3 className="font-medium">{assignment.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {assignment.submissions}/{assignment.totalStudents}
                    </p>
                    <p className="text-xs text-muted-foreground">submissions</p>
                  </div>
                  <Badge
                    variant={assignment.status === "active" ? "default" : "secondary"}
                  >
                    {assignment.status === "active" ? (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </>
                    )}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/teacher/submissions/${assignment.id}`}>
                      Evaluate
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
