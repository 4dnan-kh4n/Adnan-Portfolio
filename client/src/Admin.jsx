import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("adminToken", data.token);
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="admin-shell">
      <form className="admin-card" onSubmit={submit}>
        <p>Portfolio CMS</p>
        <h1>Admin login</h1>
        <label>
          Username or email
          <input
            required
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <a className="back-home" href="/">
          ← Back to portfolio
        </a>
      </form>
    </main>
  );
}
const fieldSets = {
  hero: [["name", "Name", "text", true], ["role", "Role", "text", true], ["headline", "Hero headline"], ["availabilityLabel", "Email link label"], ["intro", "Intro", "textarea", true], ["profileImage", "Profile image", "media"], ["resumeUrl", "Resume PDF", "media", false, "application/pdf"], ["ctas", "CTA buttons (label | link, one per line)", "pairs"]],
  about: [["heading", "About heading"], ["bio", "Bio", "textarea", true], ["location", "Location"], ["image", "About image", "media"], ["quickFacts", "Quick facts (label | value, one per line)", "pairs"], ["ctaLabel", "About CTA label"], ["ctaUrl", "About CTA link"], ["visualEyebrow", "Visual-break eyebrow"], ["visualTitle", "Visual-break title"], ["visualCaption", "Visual-break caption"], ["visualImage", "Visual-break image", "media"]],
  skills: [["name", "Skill details", "textarea", true], ["category", "Category", "text", true], ["proficiency", "Proficiency (0–100)", "number"], ["icon", "Icon"]],
  experience: [["role", "Role", "text", true], ["company", "Company", "text", true], ["location", "Location"], ["startDate", "Start date", "date", true], ["endDate", "End date", "date"], ["present", "Current role", "checkbox"], ["description", "Description", "textarea", true], ["companyLogo", "Certificate image", "media"]],
  education: [["degree", "Degree", "text", true], ["institution", "Institution", "text", true], ["university", "Board / university"], ["startYear", "Start year", "number", true], ["endYear", "End year", "number"], ["description", "Description", "textarea"]],
  projects: [["title", "Project name", "text", true], ["category", "Category", "text", true], ["description", "Description", "textarea", true], ["techStack", "Tech stack (comma separated)"], ["images", "Project images", "media", false, "image/*", true], ["liveLink", "Live link", "url"], ["githubLink", "GitHub link", "url"], ["featured", "Featured project", "checkbox"]],
  achievements: [["title", "Achievement title", "text", true], ["organization", "Event / organization", "text", true], ["date", "Date", "date"], ["description", "Description", "textarea", true], ["certificateUrl", "Certificate image", "media"]],
  contact: [["email", "Email", "email", true], ["phone", "Phone", "tel"], ["linkedIn", "LinkedIn URL", "url"], ["github", "GitHub URL", "url"], ["socials", "Other social links (platform | URL, one per line)", "pairs"], ["heading", "Contact heading"], ["highlightedWord", "Highlighted word"], ["intro", "Contact intro", "textarea"], ["footerCopyright", "Footer name"]],
};
const singletonSections = new Set(["hero", "about", "contact"]);
const pairLabels = { ctas: ["label", "url"], quickFacts: ["label", "value"], socials: ["platform", "url"] };
const readError = (error, fallback) => error.response?.data?.message || fallback;
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const pairText = (key, value) => (value || []).map((row) => `${row[pairLabels[key][0]] || ""} | ${row[pairLabels[key][1]] || ""}`).join("\n");

function Dashboard() {
  const navigate = useNavigate();
  const sections = [...Object.keys(fieldSets), "security"];
  const [section, setSection] = useState("hero");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const token = {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  };
  const load = async () => {
    if (section === "security") return;
    setBusy(true); setError("");
    try {
      const { data } = await api.get(`/admin/${section}`, token);
      const value = Array.isArray(data) ? data : data ? [data] : [];
      setItems(value); setForm(value[0] || {});
    } catch (requestError) { setError(readError(requestError, "Unable to load this section.")); }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); }, [section]);
  const changeSection = (name) => { setSection(name); setForm({}); setMessage(""); setError(""); };
  const upload = async (files, key, multiple = false) => {
    if (!files?.length) return;
    setBusy(true); setError(""); setMessage("Uploading file…");
    try {
      const urls = await Promise.all([...files].map(async (file) => {
        const data = new FormData(); data.append("file", file);
        return (await api.post("/admin/upload", data, token)).data.url;
      }));
      setForm((current) => ({ ...current, [key]: multiple ? [...(current[key] || []), ...urls] : urls[0] }));
      setMessage("Upload complete. Save changes to publish it.");
    } catch (requestError) { setMessage(""); setError(readError(requestError, "Upload failed.")); }
    finally { setBusy(false); }
  };
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const body = { ...form };
    fieldSets[section].forEach(([key, , type]) => {
      if (type === "pairs" && typeof body[key] === "string") body[key] = body[key].split("\n").map((line) => line.split("|").map((part) => part.trim())).filter((parts) => parts[0] && parts[1]).map(([first, second]) => ({ [pairLabels[key][0]]: first, [pairLabels[key][1]]: second }));
      if (key === "techStack" && typeof body[key] === "string") body[key] = body[key].split(",").map((item) => item.trim()).filter(Boolean);
      if (type === "number" && body[key] !== "" && body[key] !== undefined) body[key] = Number(body[key]);
    });
    try {
      if (body._id) await api.put(`/admin/${section}/${body._id}`, body, token); else await api.post(`/admin/${section}`, body, token);
      setMessage("Saved. Refresh the portfolio to see the update."); await load();
    } catch (requestError) { setError(readError(requestError, "Unable to save changes.")); }
    finally { setBusy(false); }
  };
  const remove = (key, index) => setForm((current) => ({ ...current, [key]: Array.isArray(current[key]) ? current[key].filter((_, itemIndex) => itemIndex !== index) : "" }));
  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setBusy(true); setError("");
    try { await api.delete(`/admin/${section}/${id}`, token); setMessage("Deleted."); await load(); }
    catch (requestError) { setError(readError(requestError, "Unable to delete this item.")); }
    finally { setBusy(false); }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    if (password.newPassword !== password.confirmPassword) return setError("New passwords do not match.");
    setBusy(true); setError(""); setMessage("");
    try { const { data } = await api.post("/admin/password", password, token); setMessage(data.message); setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    catch (requestError) { setError(readError(requestError, "Unable to change password.")); }
    finally { setBusy(false); }
  };
  return <main className="admin-dashboard">
    <aside><p>Portfolio CMS</p>{sections.map((name) => <button type="button" className={name === section ? "is-active" : ""} onClick={() => changeSection(name)} key={name}>{name}</button>)}<button type="button" onClick={() => { localStorage.removeItem("adminToken"); navigate("/admin/login"); }}>Log out</button></aside>
    {(message || error) && <div className={`admin-toast${error ? " error" : ""}`} role={error ? "alert" : "status"} aria-live="polite"><span>{error || message}</span><button type="button" onClick={() => { setMessage(""); setError(""); }} aria-label="Dismiss notification">×</button></div>}
    <section className="admin-content"><p className="admin-kicker">{section === "security" ? "Account" : singletonSections.has(section) ? "Site settings" : "Content collection"}</p><h1>{section}</h1>
      {section === "security" ? <form className="admin-form" onSubmit={changePassword}><label>Current password<input required type="password" value={password.currentPassword} onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })} /></label><label>New password<input required minLength="12" type="password" value={password.newPassword} onChange={(event) => setPassword({ ...password, newPassword: event.target.value })} /></label><label>Confirm new password<input required minLength="12" type="password" value={password.confirmPassword} onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })} /></label><button disabled={busy}>{busy ? "Saving…" : "Update password"}</button></form> : <><div className="admin-list">{items.map((item) => <article key={item._id}><b>{item.title || item.name || item.role || item.degree || item.email || "Site settings"}</b>{!singletonSections.has(section) && <><button type="button" onClick={() => setForm(item)}>Edit</button><button className="danger" type="button" onClick={() => deleteItem(item._id)}>Delete</button></>}</article>)}</div>
      <form className="admin-form" onSubmit={save}>{fieldSets[section].map(([key, label, type = "text", required, accept, multiple]) => <label key={key}>{label}{type === "textarea" || type === "pairs" ? <textarea required={required} placeholder={type === "pairs" ? "One item per line: label | value" : ""} value={type === "pairs" ? (typeof form[key] === "string" ? form[key] : pairText(key, form[key])) : form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /> : type === "checkbox" ? <input className="admin-check" type="checkbox" checked={Boolean(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} /> : type === "media" ? <><input type="file" accept={accept || "image/*"} multiple={multiple} disabled={busy} onChange={(event) => upload(event.target.files, key, multiple)} /><div className="media-previews">{(Array.isArray(form[key]) ? form[key] : form[key] ? [form[key]] : []).map((url, index) => <div className="media-preview" key={url}><a href={url} target="_blank" rel="noreferrer">{url.includes(".pdf") ? "PDF uploaded" : <img src={url} alt="Uploaded media preview" />}</a><button type="button" onClick={() => remove(key, index)}>Remove</button></div>)}</div></> : <input required={required} type={type} value={type === "date" ? toDateInput(form[key]) : form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />}</label>)}
      {!singletonSections.has(section) && <button type="button" className="secondary" onClick={() => setForm({})}>Add new</button>}<button disabled={busy}>{busy ? "Saving…" : "Save changes"}</button></form></>}</section>
  </main>;
}
function Protected({ children }) {
  return localStorage.getItem("adminToken") ? (
    children
  ) : (
    <Navigate to="/admin/login" replace />
  );
}

export default function AdminPage({ mode }) {
  return mode === "login" ? <Login /> : <Protected><Dashboard /></Protected>;
}

