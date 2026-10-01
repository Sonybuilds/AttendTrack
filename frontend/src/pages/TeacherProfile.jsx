import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from "@mui/material";
import { FiArrowLeft, FiEdit3, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const profileFields = [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email address", type: "email", required: true },
  { name: "phone", label: "Phone number", type: "tel" },
  { name: "location", label: "Location" },
  { name: "dob", label: "Date of birth", type: "date" },
  { name: "gender", label: "Gender" },
  { name: "address", label: "Address", multiline: true },
  { name: "qualification", label: "Highest qualification" },
  { name: "specialization", label: "Specialization" },
  { name: "graduationYear", label: "Graduation year", type: "number" },
  { name: "certification", label: "Certification" },
  { name: "experience", label: "Experience" },
  { name: "workingSince", label: "Working since" },
];

const emptyProfile = Object.fromEntries(profileFields.map(({ name }) => [name, ""]));
const profileSections = [
  { title: "Personal information", fields: ["name", "dob", "gender", "phone", "email", "address", "location"] },
  { title: "Professional information", fields: ["qualification", "specialization", "graduationYear", "certification", "experience", "workingSince"] },
];

export default function TeacherProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(emptyProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/teacher/session")
      .then((response) => {
        if (!active) return;
        const teacher = response.data.teacher || {};
        setProfile({ ...emptyProfile, ...teacher });
        setTeacherId(teacher.id || "");
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load your profile");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const initials = useMemo(
    () => (profile.name || "Teacher").trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(""),
    [profile.name]
  );

  const openEditor = () => {
    setForm({ ...emptyProfile, ...profile });
    setError("");
    setEditOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await api.put("/teacher/profile", form);
      const teacher = response.data.teacher || form;
      setProfile({ ...emptyProfile, ...teacher });
      setTeacherId(teacher.id || teacherId);
      setEditOpen(false);
      setMessage(response.data.message || "Profile updated successfully");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update your profile");
    } finally {
      setSaving(false);
    }
  };

  const valueFor = (fieldName) => profile[fieldName]?.trim() || "Not added";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Button onClick={() => navigate("/attendtrack/dashboard")} startIcon={<FiArrowLeft />} className="!normal-case !text-slate-600">Back to dashboard</Button>
          <Button onClick={openEditor} variant="contained" startIcon={<FiEdit3 />} disabled={loading || !profile.name} className="!bg-blue-700 !normal-case hover:!bg-blue-800">Edit Profile</Button>
        </header>

        {error && !editOpen && <Alert severity="error" className="!mb-4">{error}</Alert>}

        {loading ? (
          <section className="flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white"><CircularProgress /></section>
        ) : (
          <>
            <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
              <Avatar sx={{ width: 88, height: 88, bgcolor: "#dbeafe", color: "#1d4ed8", fontSize: 28, fontWeight: 700 }}>{initials}</Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Teacher profile</p>
                <h1 className="mt-1 truncate text-2xl font-bold tracking-tight">{profile.name || "Teacher"}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500"><FiMail />{profile.email || "Email not added"}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3 sm:min-w-40">
                <p className="text-xs text-slate-500">Teacher ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-800">{teacherId || "—"}</p>
              </div>
            </section>

            <div className="mt-5 grid gap-5">
              {profileSections.map((section) => (
                <section key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="mb-5 text-base font-semibold">{section.title}</h2>
                  <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                    {section.fields.map((fieldName) => {
                      const field = profileFields.find((item) => item.name === fieldName);
                      const Icon = fieldName === "email" ? FiMail : fieldName === "phone" ? FiPhone : fieldName === "address" || fieldName === "location" ? FiMapPin : FiUser;
                      return (
                        <div key={fieldName} className="flex min-w-0 gap-3">
                          <span className="mt-0.5 text-slate-400"><Icon /></span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500">{field.label}</p>
                            <p className="mt-1 break-words text-sm font-medium text-slate-800">{valueFor(fieldName)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      <Dialog open={editOpen} onClose={() => { if (!saving) setEditOpen(false); }} fullWidth maxWidth="md">
        <form onSubmit={handleSave}>
          <DialogTitle>Edit teacher profile</DialogTitle>
          <DialogContent>
            <p className="mb-4 text-sm text-slate-500">Update your personal and professional details.</p>
            {error && <Alert severity="error" className="!mb-4">{error}</Alert>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profileFields.map((field) => (
                <TextField
                  key={field.name}
                  fullWidth
                  label={field.label}
                  type={field.type || "text"}
                  required={field.required}
                  multiline={field.multiline}
                  minRows={field.multiline ? 2 : undefined}
                  value={form[field.name] || ""}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  slotProps={field.type === "date" ? { inputLabel: { shrink: true } } : undefined}
                  inputProps={field.type === "number" ? { min: 1900, max: new Date().getFullYear() + 10 } : undefined}
                />
              ))}
            </div>
          </DialogContent>
          <DialogActions className="!px-6 !pb-5">
            <Button onClick={() => setEditOpen(false)} disabled={saving} className="!normal-case">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} className="!bg-blue-700 !normal-case">
              {saving ? <><CircularProgress size={17} color="inherit" className="!mr-2" />Saving</> : "Save changes"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage("")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setMessage("")}>{message}</Alert>
      </Snackbar>
    </main>
  );
}
