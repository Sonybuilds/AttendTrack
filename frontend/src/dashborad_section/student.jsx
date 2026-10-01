import { useState } from "react";
import { Button } from "@mui/material";
import { IoIosAdd } from "react-icons/io";
import StudentTable from "../components/studentTable";
import StudentForm from "../forms/studentForm";

export default function Student() {
  const [formOpen, setFormOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const closeForm = () => {
    setFormOpen(false);
    setEditStudent(null);
  };

  return (
    <main className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <StudentForm
          key={editStudent?._id || "new-student"}
          open={formOpen}
          onClose={closeForm}
          editData={editStudent}
          onSuccess={() => setRefreshKey((current) => current + 1)}
        />

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Management</h1>
            <p className="mt-1 text-sm text-slate-500">Manage student profiles, enrolled subjects, and academic details.</p>
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            variant="contained"
            color="primary"
            startIcon={<IoIosAdd className="text-xl" />}
            className="!h-11 !w-fit !rounded-lg !bg-blue-700 !px-5 !font-semibold !normal-case hover:!bg-blue-800"
          >
            Add Student
          </Button>
        </header>

        <StudentTable key={refreshKey} onEdit={(student) => { setEditStudent(student); setFormOpen(true); }} />
      </div>
    </main>
  );
}
