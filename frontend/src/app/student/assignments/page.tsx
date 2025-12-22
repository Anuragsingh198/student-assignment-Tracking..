import { StudentAssignmentsList } from "@/components/student/student-assignments-list";

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Assignments</h1>
      <StudentAssignmentsList />
    </div>
  );
}
