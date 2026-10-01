import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { FiPlus, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const blankTeacher = { name: "", email: "", password: "" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(blankTeacher);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/teachers");
      setTeachers(response.data.teachers || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load teacher accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(loadTeachers); }, [loadTeachers]);

  const createTeacher = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await api.post("/admin/teachers", form);
      setMessage(`Teacher account created. Teacher ID: ${response.data.teacher.id}`);
      setDialogOpen(false);
      setForm(blankTeacher);
      await loadTeachers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create teacher account");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try { await api.post("/logout"); } catch { /* The cookie may already be expired. */ }
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">AttendTrack administration</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Teacher accounts</h1>
            <p className="mt-1 text-sm text-slate-500">Create and manage teacher access to the academic workspace.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={logout} variant="outlined" className="!normal-case">Log out</Button>
            <Button onClick={() => { setError(""); setDialogOpen(true); }} variant="contained" startIcon={<FiPlus />} className="!bg-blue-700 !normal-case">Create teacher</Button>
          </div>
        </header>

        {error && !dialogOpen && <Alert severity="error" className="!mb-4">{error}</Alert>}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4 sm:px-5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700"><FiUsers /></span>
            <div><h2 className="text-sm font-semibold text-slate-900">Teachers</h2><p className="mt-0.5 text-xs text-slate-500">{teachers.length} account{teachers.length === 1 ? "" : "s"}</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Teacher</th><th className="px-4 py-3 font-semibold">Teacher ID</th><th className="px-4 py-3 font-semibold">Email</th><th className="px-4 py-3 font-semibold">Created</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan="4" className="px-4 py-12 text-center"><CircularProgress size={24} /></td></tr> : teachers.length ? teachers.map((teacher) => (
                  <tr key={teacher._id || teacher.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">{teacher.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{teacher.id}</td>
                    <td className="px-4 py-3 text-slate-600">{teacher.email}</td>
                    <td className="px-4 py-3 text-slate-500">{teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="px-4 py-12 text-center text-slate-500">No teacher accounts found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={dialogOpen} onClose={() => { if (!saving) { setDialogOpen(false); setError(""); } }} fullWidth maxWidth="sm">
        <form onSubmit={createTeacher}>
          <DialogTitle>Create a teacher account</DialogTitle>
          <DialogContent>
            <p className="mb-4 text-sm text-slate-500">The new teacher will sign in with the generated Teacher ID and this password.</p>
            {error && <Alert severity="error" className="!mb-4">{error}</Alert>}
            <div className="grid gap-4">
              <TextField autoFocus required label="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <TextField required type="email" label="Email address" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              <TextField required type="password" label="Initial password" helperText="At least 8 characters" inputProps={{ minLength: 8 }} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
            </div>
          </DialogContent>
          <DialogActions className="!px-6 !pb-5">
            <Button onClick={() => { setDialogOpen(false); setError(""); }} disabled={saving} className="!normal-case">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} className="!bg-blue-700 !normal-case">{saving ? "Creating…" : "Create teacher"}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
    </main>
  );
}
