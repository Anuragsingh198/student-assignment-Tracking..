import { AssignmentsList } from "@/components/teacher/assignments-list";

export default function TeacherAssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Assignments</h1>
      </div>
      <AssignmentsList />
    </div>
  );
}
