import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Smart Assignment & Evaluation System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Streamline your teaching workflow with AI-powered assignment creation,
            automated grading assistance, and comprehensive evaluation tools.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>For Teachers</CardTitle>
              <CardDescription>
                Create assignments, define rubrics, and evaluate submissions with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Smart assignment creation</li>
                <li>• AI-powered feedback suggestions</li>
                <li>• Comprehensive evaluation tools</li>
                <li>• Real-time submission tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Students</CardTitle>
              <CardDescription>
                Submit assignments, track progress, and receive detailed feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Easy assignment submission</li>
                <li>• Progress tracking</li>
                <li>• Detailed feedback</li>
                <li>• Submission history</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Leverage artificial intelligence for better teaching and learning outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Automated grading assistance</li>
                <li>• Smart feedback generation</li>
                <li>• Plagiarism detection</li>
                <li>• Learning analytics</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
