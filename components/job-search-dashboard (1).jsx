import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, ExternalLink, Search, Filter, Calendar, Briefcase, BookOpen, CheckCircle2, Circle, X, TrendingUp, Clock, Target, Users, Mail, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from "recharts";

const STAGES = ["Interested", "Applied", "Phone Screen", "Interview", "Offer", "Rejected", "Withdrawn"];
const ROLE_TYPES = ["Business Analyst", "Marketing Analyst", "Consulting Analyst", "Product Analyst", "Data Analyst", "Research Analyst", "Sports Analyst", "Marketing", "Other"];

const STAGE_COLORS = {
  "Interested": "#8a8578",
  "Applied": "#3d5a80",
  "Phone Screen": "#b08968",
  "Interview": "#bc6c25",
  "Offer": "#386641",
  "Rejected": "#9b2226",
  "Withdrawn": "#6c757d",
};

const JOB_BOARDS = [
  { id: "linkedin", name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/search/?keywords=analyst", type: "iframe", note: "LinkedIn blocks embedding — use 'Open in new tab'." },
  { id: "builtin", name: "Built In Chicago", url: "https://www.builtinchicago.org/jobs", type: "iframe", note: "Built In may block embedding — open in a new tab if blank." },
  { id: "jobright", name: "Jobright", url: "https://jobright.ai/", type: "iframe", note: "If this loads blank, the site blocks iframes." },
  { id: "gmail", name: "Gmail", url: "https://mail.google.com/", type: "external", note: "Gmail does not allow embedding for security. Click below to open in a new tab." },
  { id: "templates", name: "Email Templates", url: "https://docs.google.com/document/d/1ASctK_Mhn1T0KrlvmYVxUtVpYHaMPoscTGFYnr83hoo/preview", externalUrl: "https://docs.google.com/document/d/1ASctK_Mhn1T0KrlvmYVxUtVpYHaMPoscTGFYnr83hoo/edit", type: "iframe", note: "Your email templates doc. Make sure sharing is set to 'anyone with the link' for it to render here." },
  { id: "checklist", name: "Application Checklist", url: "https://docs.google.com/document/d/1KlIFPBk-8URMWPDypHBZmTqn65nUrlkN99Z_XTJET9k/preview", externalUrl: "https://docs.google.com/document/d/1KlIFPBk-8URMWPDypHBZmTqn65nUrlkN99Z_XTJET9k/edit", type: "iframe", note: "Your application checklist. Make sure sharing is set to 'anyone with the link' for it to render here." },
];

const STARTER_PREP = [
  { q: "Walk me through a time you used data to influence a business decision.", tags: ["behavioral", "analyst"] },
  { q: "How would you estimate the market size for [product] in the US?", tags: ["case", "market-sizing"] },
  { q: "A key metric dropped 20% overnight. How do you investigate?", tags: ["case", "product"] },
  { q: "Explain a complex analysis to a non-technical stakeholder.", tags: ["behavioral", "communication"] },
  { q: "Describe your SQL workflow for a messy new dataset.", tags: ["technical", "sql"] },
  { q: "Why consulting / why this firm?", tags: ["behavioral", "consulting"] },
];

export default function JobSearchDashboard() {
  const [tab, setTab] = useState("applications");
  const [apps, setApps] = useState([]);
  const [saved, setSaved] = useState([]);
  const [prep, setPrep] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [contact, setContact] = useState({ name: "", headline: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [showAddApp, setShowAddApp] = useState(false);
  const [showAddSaved, setShowAddSaved] = useState(false);
  const [showAddPrep, setShowAddPrep] = useState(false);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [filterStage, setFilterStage] = useState("All");
  const [query, setQuery] = useState("");

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const [a, s, p, c, pf] = await Promise.all([
          window.storage.get("js:apps").catch(() => null),
          window.storage.get("js:saved").catch(() => null),
          window.storage.get("js:prep").catch(() => null),
          window.storage.get("js:contact").catch(() => null),
          window.storage.get("js:portfolio").catch(() => null),
        ]);
        setApps(a ? JSON.parse(a.value) : []);
        setSaved(s ? JSON.parse(s.value) : []);
        setPrep(p ? JSON.parse(p.value) : STARTER_PREP.map((x, i) => ({ ...x, id: `seed-${i}`, notes: "", done: false })));
        if (c) setContact(JSON.parse(c.value));
        setPortfolio(pf ? JSON.parse(pf.value) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = async (key, val) => {
    try { await window.storage.set(key, JSON.stringify(val)); } catch (e) { console.error("save failed", e); }
  };

  const addApp = (data) => {
    const next = [{ id: `a-${Date.now()}`, createdAt: new Date().toISOString(), stage: "Applied", ...data }, ...apps];
    setApps(next); persist("js:apps", next);
  };
  const updateApp = (id, patch) => {
    const next = apps.map(a => a.id === id ? { ...a, ...patch } : a);
    setApps(next); persist("js:apps", next);
  };
  const deleteApp = (id) => {
    const next = apps.filter(a => a.id !== id);
    setApps(next); persist("js:apps", next);
  };

  const addSaved = (data) => {
    const next = [{ id: `s-${Date.now()}`, createdAt: new Date().toISOString(), ...data }, ...saved];
    setSaved(next); persist("js:saved", next);
  };
  const deleteSaved = (id) => {
    const next = saved.filter(s => s.id !== id);
    setSaved(next); persist("js:saved", next);
  };
  const moveToApps = (item) => {
    addApp({ company: item.company, role: item.role, url: item.url, roleType: item.roleType, location: item.location, notes: item.notes });
    deleteSaved(item.id);
    setTab("applications");
  };

  const addPrep = (data) => {
    const next = [{ id: `p-${Date.now()}`, done: false, notes: "", tags: [], ...data }, ...prep];
    setPrep(next); persist("js:prep", next);
  };
  const updatePrep = (id, patch) => {
    const next = prep.map(p => p.id === id ? { ...p, ...patch } : p);
    setPrep(next); persist("js:prep", next);
  };
  const deletePrep = (id) => {
    const next = prep.filter(p => p.id !== id);
    setPrep(next); persist("js:prep", next);
  };

  const addPortfolio = (data) => {
    const next = [{ id: `pf-${Date.now()}`, createdAt: new Date().toISOString(), ...data }, ...portfolio];
    setPortfolio(next); persist("js:portfolio", next);
  };
  const updatePortfolio = (id, patch) => {
    const next = portfolio.map(p => p.id === id ? { ...p, ...patch } : p);
    setPortfolio(next); persist("js:portfolio", next);
  };
  const deletePortfolio = (id) => {
    const next = portfolio.filter(p => p.id !== id);
    setPortfolio(next); persist("js:portfolio", next);
  };

  const stats = useMemo(() => {
    const byStage = {};
    STAGES.forEach(s => byStage[s] = 0);
    apps.forEach(a => { byStage[a.stage] = (byStage[a.stage] || 0) + 1; });
    const active = apps.filter(a => !["Rejected", "Withdrawn", "Offer"].includes(a.stage)).length;
    const inPipeline = apps.filter(a => ["Phone Screen", "Interview"].includes(a.stage)).length;
    const doneCount = prep.filter(p => p.done).length;
    return { byStage, total: apps.length, active, inPipeline, savedCount: saved.length, prepDone: doneCount, prepTotal: prep.length };
  }, [apps, saved, prep]);

  const filteredApps = useMemo(() => {
    return apps.filter(a => {
      if (filterStage !== "All" && a.stage !== filterStage) return false;
      if (query) {
        const q = query.toLowerCase();
        return (a.company || "").toLowerCase().includes(q) || (a.role || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [apps, filterStage, query]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f1ea", fontFamily: "Georgia, serif", color: "#1a1a1a" }}>
        Loading your workspace…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f1ea", color: "#1a1a1a", fontFamily: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400&family=JetBrains+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .fraunces { font-family: 'Fraunces', Georgia, serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        input, textarea, select { font-family: inherit; }
        .js-card { background: #fbf9f3; border: 1px solid #d9d3c3; transition: all 0.15s ease; }
        .js-card:hover { border-color: #1a1a1a; box-shadow: 4px 4px 0 #1a1a1a; transform: translate(-2px, -2px); }
        .js-btn-primary { background: #1a1a1a; color: #f4f1ea; padding: 10px 18px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
        .js-btn-primary:hover { background: #bc6c25; }
        .js-btn-ghost { padding: 8px 14px; font-size: 13px; color: #5a5348; }
        .js-btn-ghost:hover { color: #1a1a1a; }
        .js-input { width: 100%; padding: 10px 12px; background: #fbf9f3; border: 1px solid #c9c2b0; font-size: 15px; color: #1a1a1a; outline: none; }
        .js-input:focus { border-color: #1a1a1a; background: #fff; }
        .js-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #5a5348; font-weight: 600; margin-bottom: 6px; display: block; font-family: 'JetBrains Mono', monospace; }
        .js-tab { padding: 14px 0; font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; color: #5a5348; border-bottom: 2px solid transparent; font-weight: 600; margin-right: 32px; }
        .js-tab.active { color: #1a1a1a; border-bottom-color: #bc6c25; }
        .js-tab:hover { color: #1a1a1a; }
        .stage-pill { display: inline-block; padding: 3px 10px; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; color: #fbf9f3; font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Masthead */}
      <header style={{ borderBottom: "2px solid #1a1a1a", padding: "28px 48px 20px", background: "#f4f1ea" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8a8578", marginBottom: 6, lineHeight: 1.6 }}>
              INDIANA UNIVERSITY · KELLEY SCHOOL OF BUSINESS<br />
              B.S. BUSINESS ANALYTICS & MARKETING
            </div>
            <h1 className="fraunces" style={{ fontSize: 44, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", fontStyle: "italic" }}>
              Drew Glassman Jobs
            </h1>
          </div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.15em", color: "#5a5348", textAlign: "right" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Stats ribbon */}
      <section style={{ padding: "24px 48px", background: "#1a1a1a", color: "#f4f1ea", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
        {[
          { label: "Applications", val: stats.total, icon: Briefcase },
          { label: "Active", val: stats.active, icon: TrendingUp },
          { label: "In Pipeline", val: stats.inPipeline, icon: Clock },
          { label: "Prep Complete", val: `${stats.prepDone}/${stats.prepTotal}`, icon: Target },
        ].map((s, i) => (
          <div key={s.label} style={{ padding: "0 24px", borderRight: i < 3 ? "1px solid #3a3a3a" : "none", display: "flex", alignItems: "center", gap: 14 }}>
            <s.icon size={20} strokeWidth={1.5} style={{ color: "#bc6c25" }} />
            <div>
              <div className="fraunces" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1 }}>{s.val}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.15em", color: "#8a8578", marginTop: 4 }}>{s.label.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <nav style={{ padding: "0 48px", borderBottom: "1px solid #d9d3c3", background: "#f4f1ea" }}>
        <button className={`js-tab ${tab === "applications" ? "active" : ""}`} onClick={() => setTab("applications")}>
          Applications · {apps.length}
        </button>
        <button className={`js-tab ${tab === "saved" ? "active" : ""}`} onClick={() => setTab("saved")}>
          Saved Listings · {saved.length}
        </button>
        <button className={`js-tab ${tab === "prep" ? "active" : ""}`} onClick={() => setTab("prep")}>
          Interview Prep · {stats.prepDone}/{stats.prepTotal}
        </button>
        <button className={`js-tab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>
          Portfolio · {portfolio.length}
        </button>
        <button className={`js-tab ${tab === "boards" ? "active" : ""}`} onClick={() => setTab("boards")}>
          Resources
        </button>
        <button className={`js-tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>
          Analytics
        </button>
        <button className={`js-tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>
          Drew's Contact Info
        </button>
      </nav>

      <main style={{ padding: "32px 48px 80px" }}>
        {tab === "applications" && (
          <ApplicationsView
            apps={filteredApps}
            allApps={apps}
            byStage={stats.byStage}
            filterStage={filterStage}
            setFilterStage={setFilterStage}
            query={query}
            setQuery={setQuery}
            onAdd={() => setShowAddApp(true)}
            onUpdate={updateApp}
            onDelete={deleteApp}
          />
        )}
        {tab === "saved" && (
          <SavedView items={saved} onAdd={() => setShowAddSaved(true)} onDelete={deleteSaved} onApply={moveToApps} />
        )}
        {tab === "prep" && (
          <PrepView items={prep} onAdd={() => setShowAddPrep(true)} onUpdate={updatePrep} onDelete={deletePrep} />
        )}
        {tab === "portfolio" && (
          <PortfolioView items={portfolio} onAdd={() => setShowAddPortfolio(true)} onUpdate={updatePortfolio} onDelete={deletePortfolio} />
        )}
        {tab === "boards" && <BoardsView />}
        {tab === "analytics" && <AnalyticsView apps={apps} />}
        {tab === "contact" && <ContactView contact={contact} onUpdate={(patch) => { const next = { ...contact, ...patch }; setContact(next); persist("js:contact", next); }} />}
      </main>

      {showAddApp && <AddAppModal onClose={() => setShowAddApp(false)} onSave={(d) => { addApp(d); setShowAddApp(false); }} />}
      {showAddSaved && <AddSavedModal onClose={() => setShowAddSaved(false)} onSave={(d) => { addSaved(d); setShowAddSaved(false); }} />}
      {showAddPrep && <AddPrepModal onClose={() => setShowAddPrep(false)} onSave={(d) => { addPrep(d); setShowAddPrep(false); }} />}
      {showAddPortfolio && <AddPortfolioModal onClose={() => setShowAddPortfolio(false)} onSave={(d) => { addPortfolio(d); setShowAddPortfolio(false); }} />}
    </div>
  );
}

function ApplicationsView({ apps, allApps, byStage, filterStage, setFilterStage, query, setQuery, onAdd, onUpdate, onDelete }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8a8578" }} />
            <input className="js-input" style={{ paddingLeft: 36, width: 240 }} placeholder="Search company or role..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select className="js-input" style={{ width: "auto" }} value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
            <option>All</option>
            {STAGES.map(s => <option key={s}>{s} ({byStage[s] || 0})</option>)}
          </select>
        </div>
        <button className="js-btn-primary" onClick={onAdd}><Plus size={16} /> Log Application</button>
      </div>

      {allApps.length === 0 ? (
        <EmptyState icon={Briefcase} title="No applications yet" body="Log your first application to start tracking. Every application you've sent, the stage it's in, and notes on conversations all stay here." cta="Log your first" onCta={onAdd} />
      ) : apps.length === 0 ? (
        <EmptyState icon={Filter} title="No matches" body="Nothing matches your filters. Clear them to see everything." />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {apps.map(a => <AppCard key={a.id} app={a} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function AppCard({ app, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="js-card" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
            <span className="stage-pill" style={{ background: STAGE_COLORS[app.stage] || "#5a5348" }}>{app.stage}</span>
            {app.hasReferral && <span className="mono" style={{ fontSize: 10, color: "#386641", letterSpacing: "0.1em", fontWeight: 700 }}>★ REFERRAL</span>}
            {app.responseReceived && <span className="mono" style={{ fontSize: 10, color: "#bc6c25", letterSpacing: "0.1em", fontWeight: 700 }}>✉ RESPONDED</span>}
            {app.roleType && <span className="mono" style={{ fontSize: 10, color: "#8a8578", letterSpacing: "0.1em" }}>{app.roleType.toUpperCase()}</span>}
            <span className="mono" style={{ fontSize: 10, color: "#8a8578" }}>
              {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          <h3 className="fraunces" style={{ fontSize: 22, margin: "0 0 4px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            {app.role}
          </h3>
          <div style={{ fontSize: 15, color: "#5a5348", fontStyle: "italic" }}>
            {app.company}{app.location && ` · ${app.location}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {app.url && (
            <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ color: "#5a5348" }} title="Open listing">
              <ExternalLink size={18} />
            </a>
          )}
          <button onClick={() => setExpanded(!expanded)} className="js-btn-ghost" style={{ padding: 4 }}>
            {expanded ? "Collapse" : "Edit"}
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px dashed #c9c2b0", display: "grid", gap: 14 }}>
          <div>
            <label className="js-label">Stage</label>
            <select className="js-input" value={app.stage} onChange={(e) => onUpdate(app.id, { stage: e.target.value })}>
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="js-label">Notes · interviews, contacts, follow-ups</label>
            <textarea className="js-input" rows={4} value={app.notes || ""} onChange={(e) => onUpdate(app.id, { notes: e.target.value })} placeholder="Recruiter name, interview feedback, things to prep..." />
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={!!app.hasReferral} onChange={(e) => onUpdate(app.id, { hasReferral: e.target.checked })} />
              Has a referral
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={!!app.responseReceived} onChange={(e) => onUpdate(app.id, { responseReceived: e.target.checked })} />
              Got a response
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="js-btn-ghost" onClick={() => { if (confirm("Delete this application?")) onDelete(app.id); }} style={{ color: "#9b2226", display: "flex", alignItems: "center", gap: 6 }}>
              <Trash2 size={14} /> Delete
            </button>
            <button className="js-btn-ghost" onClick={() => setExpanded(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SavedView({ items, onAdd, onDelete, onApply }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p className="fraunces" style={{ fontSize: 16, color: "#5a5348", margin: 0, fontStyle: "italic", maxWidth: 520 }}>
          Listings you're considering. When you apply, promote them to the ledger with one click.
        </p>
        <button className="js-btn-primary" onClick={onAdd}><Plus size={16} /> Save Listing</button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={BookOpen} title="No saved listings" body="Bookmark interesting roles here before you apply. Paste a URL and a few notes." cta="Save your first" onCta={onAdd} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
          {items.map(s => (
            <div key={s.id} className="js-card" style={{ padding: 20, display: "flex", flexDirection: "column" }}>
              {s.roleType && <span className="mono" style={{ fontSize: 10, color: "#8a8578", letterSpacing: "0.1em", marginBottom: 8 }}>{s.roleType.toUpperCase()}</span>}
              <h3 className="fraunces" style={{ fontSize: 20, margin: "0 0 4px", fontWeight: 600, letterSpacing: "-0.01em" }}>{s.role}</h3>
              <div style={{ fontSize: 14, color: "#5a5348", fontStyle: "italic", marginBottom: 10 }}>
                {s.company}{s.location && ` · ${s.location}`}
              </div>
              {s.notes && <p style={{ fontSize: 14, color: "#3a3a3a", margin: "10px 0", lineHeight: 1.5 }}>{s.notes}</p>}
              <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", borderTop: "1px dashed #c9c2b0" }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="js-btn-ghost" style={{ padding: 0, fontWeight: 600, color: "#bc6c25" }} onClick={() => onApply(s)}>→ Mark Applied</button>
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="js-btn-ghost" style={{ padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}>View <ExternalLink size={12} /></a>}
                </div>
                <button onClick={() => onDelete(s.id)} className="js-btn-ghost" style={{ padding: 0, color: "#9b2226" }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PrepView({ items, onAdd, onUpdate, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p className="fraunces" style={{ fontSize: 16, color: "#5a5348", margin: 0, fontStyle: "italic", maxWidth: 520 }}>
          Practice questions and your drafted answers. Tap a card to write notes; check it off when you can answer cold.
        </p>
        <button className="js-btn-primary" onClick={onAdd}><Plus size={16} /> Add Question</button>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map(p => (
          <div key={p.id} className="js-card" style={{ padding: 20, opacity: p.done ? 0.6 : 1 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <button onClick={() => onUpdate(p.id, { done: !p.done })} style={{ padding: 2, marginTop: 2, color: p.done ? "#386641" : "#8a8578" }}>
                {p.done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </button>
              <div style={{ flex: 1 }}>
                <div className="fraunces" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.4, textDecoration: p.done ? "line-through" : "none" }}>
                  {p.q}
                </div>
                {p.tags && p.tags.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {p.tags.map(t => <span key={t} className="mono" style={{ fontSize: 10, color: "#8a8578", letterSpacing: "0.08em" }}>#{t}</span>)}
                  </div>
                )}
                {expandedId === p.id && (
                  <div style={{ marginTop: 14 }}>
                    <label className="js-label">Your answer / notes</label>
                    <textarea className="js-input" rows={5} value={p.notes || ""} onChange={(e) => onUpdate(p.id, { notes: e.target.value })} placeholder="Draft your STAR answer, bullet points, key examples..." />
                  </div>
                )}
                {expandedId !== p.id && p.notes && (
                  <p style={{ fontSize: 13, color: "#5a5348", margin: "10px 0 0", fontStyle: "italic" }}>
                    {p.notes.slice(0, 140)}{p.notes.length > 140 ? "…" : ""}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="js-btn-ghost" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                  {expandedId === p.id ? "Close" : "Notes"}
                </button>
                <button onClick={() => onDelete(p.id)} className="js-btn-ghost" style={{ color: "#9b2226" }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardsView() {
  const [activeBoard, setActiveBoard] = useState(JOB_BOARDS[0].id);
  const [loadedKey, setLoadedKey] = useState(0);
  const board = JOB_BOARDS.find(b => b.id === activeBoard);
  const openUrl = board.externalUrl || board.url;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <p className="fraunces" style={{ fontSize: 16, color: "#5a5348", margin: "0 0 16px", fontStyle: "italic", maxWidth: 640 }}>
          Job boards, Gmail, and your reference docs — all in one place. Some sites (LinkedIn, Gmail) block iframe embedding for security; use "Open in new tab" when that happens.
        </p>
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #d9d3c3", marginBottom: 0, flexWrap: "wrap" }}>
          {JOB_BOARDS.map(b => (
            <button
              key={b.id}
              onClick={() => { setActiveBoard(b.id); setLoadedKey(k => k + 1); }}
              className="mono"
              style={{
                padding: "10px 18px",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: activeBoard === b.id ? "#1a1a1a" : "#8a8578",
                borderBottom: activeBoard === b.id ? "2px solid #bc6c25" : "2px solid transparent",
                background: activeBoard === b.id ? "#fbf9f3" : "transparent",
                marginBottom: -1,
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid #d9d3c3", background: "#fbf9f3" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #d9d3c3", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#5a5348", fontStyle: "italic" }}>{board.note}</div>
          <div style={{ display: "flex", gap: 8 }}>
            {board.type === "iframe" && (
              <button className="js-btn-ghost" onClick={() => setLoadedKey(k => k + 1)} style={{ fontSize: 12 }}>↻ Reload</button>
            )}
            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="js-btn-primary" style={{ padding: "8px 14px", fontSize: 12 }}>
              <ExternalLink size={14} /> Open in new tab
            </a>
          </div>
        </div>
        {board.type === "iframe" ? (
          <iframe
            key={`${board.id}-${loadedKey}`}
            src={board.url}
            title={board.name}
            style={{ width: "100%", height: "calc(100vh - 360px)", minHeight: 500, border: "none", background: "#fff" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div style={{ padding: "80px 24px", textAlign: "center", minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div className="fraunces" style={{ fontSize: 28, fontStyle: "italic", fontWeight: 500 }}>
              {board.name} cannot be embedded
            </div>
            <p style={{ color: "#5a5348", maxWidth: 480, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              For your account's security, {board.name} blocks being loaded inside other websites. Click below to open it in a new browser tab — you can keep this dashboard open in another tab and flip between them.
            </p>
            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="js-btn-primary">
              <ExternalLink size={16} /> Open {board.name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView({ apps }) {
  const analytics = useMemo(() => {
    const total = apps.length;
    if (total === 0) return null;

    const responded = apps.filter(a => a.responseReceived || !["Applied", "Interested"].includes(a.stage)).length;
    const withReferral = apps.filter(a => a.hasReferral).length;
    const interviews = apps.filter(a => ["Phone Screen", "Interview", "Offer"].includes(a.stage)).length;
    const offers = apps.filter(a => a.stage === "Offer").length;
    const rejected = apps.filter(a => a.stage === "Rejected").length;
    const active = apps.filter(a => !["Rejected", "Withdrawn", "Offer"].includes(a.stage)).length;

    // Referral vs no-referral success
    const refApps = apps.filter(a => a.hasReferral);
    const nonRefApps = apps.filter(a => !a.hasReferral);
    const refInterview = refApps.filter(a => ["Phone Screen", "Interview", "Offer"].includes(a.stage)).length;
    const nonRefInterview = nonRefApps.filter(a => ["Phone Screen", "Interview", "Offer"].includes(a.stage)).length;

    // By role type - interview rate
    const byRoleType = {};
    apps.forEach(a => {
      const rt = a.roleType || "Other";
      if (!byRoleType[rt]) byRoleType[rt] = { total: 0, responded: 0, interview: 0, offer: 0 };
      byRoleType[rt].total += 1;
      if (a.responseReceived || !["Applied", "Interested"].includes(a.stage)) byRoleType[rt].responded += 1;
      if (["Phone Screen", "Interview", "Offer"].includes(a.stage)) byRoleType[rt].interview += 1;
      if (a.stage === "Offer") byRoleType[rt].offer += 1;
    });

    const roleTypeData = Object.entries(byRoleType)
      .map(([name, d]) => ({
        name,
        total: d.total,
        interview: d.interview,
        responseRate: d.total > 0 ? Math.round((d.responded / d.total) * 100) : 0,
        interviewRate: d.total > 0 ? Math.round((d.interview / d.total) * 100) : 0,
      }))
      .sort((a, b) => b.interviewRate - a.interviewRate);

    // Stage funnel
    const funnel = STAGES.filter(s => !["Withdrawn"].includes(s)).map(s => ({
      stage: s,
      count: apps.filter(a => a.stage === s).length,
      color: STAGE_COLORS[s],
    }));

    // Applications over time (by week)
    const weekMap = {};
    apps.forEach(a => {
      const d = new Date(a.createdAt);
      const monday = new Date(d);
      monday.setDate(d.getDate() - d.getDay() + 1);
      const key = monday.toISOString().slice(0, 10);
      weekMap[key] = (weekMap[key] || 0) + 1;
    });
    const timeline = Object.entries(weekMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      }));

    return {
      total, responded, withReferral, interviews, offers, rejected, active,
      responseRate: Math.round((responded / total) * 100),
      interviewRate: Math.round((interviews / total) * 100),
      offerRate: Math.round((offers / total) * 100),
      referralRate: Math.round((withReferral / total) * 100),
      refInterviewRate: refApps.length > 0 ? Math.round((refInterview / refApps.length) * 100) : 0,
      nonRefInterviewRate: nonRefApps.length > 0 ? Math.round((nonRefInterview / nonRefApps.length) * 100) : 0,
      refApps: refApps.length,
      nonRefApps: nonRefApps.length,
      roleTypeData,
      funnel,
      timeline,
    };
  }, [apps]);

  if (!analytics) {
    return <EmptyState icon={TrendingUp} title="No data yet" body="Log some applications and your analytics will appear here — response rates, where your best chances are, referral impact, and more." />;
  }

  const { total, responded, withReferral, interviews, offers, responseRate, interviewRate, offerRate, referralRate, refInterviewRate, nonRefInterviewRate, refApps, nonRefApps, roleTypeData, funnel, timeline } = analytics;

  const bestCategory = roleTypeData[0];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Headline funnel metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <MetricCard label="Response Rate" value={`${responseRate}%`} detail={`${responded} of ${total} applications`} color="#3d5a80" />
        <MetricCard label="Interview Rate" value={`${interviewRate}%`} detail={`${interviews} reached interview stage`} color="#bc6c25" />
        <MetricCard label="Offer Rate" value={`${offerRate}%`} detail={`${offers} offer${offers === 1 ? "" : "s"}`} color="#386641" />
        <MetricCard label="Referral Usage" value={`${referralRate}%`} detail={`${withReferral} with referrals`} color="#9b2226" />
      </div>

      {/* Best bet callout */}
      {bestCategory && bestCategory.total >= 2 && (
        <div className="js-card" style={{ padding: "20px 24px", background: "#1a1a1a", color: "#f4f1ea", border: "1px solid #1a1a1a" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.15em", color: "#bc6c25", marginBottom: 8 }}>★ YOUR BEST CHANCES</div>
          <div className="fraunces" style={{ fontSize: 22, fontWeight: 500, fontStyle: "italic", lineHeight: 1.3 }}>
            {bestCategory.name} roles have your highest interview rate at{" "}
            <span style={{ color: "#bc6c25", fontWeight: 700 }}>{bestCategory.interviewRate}%</span>
            {" "}({bestCategory.interview} of {bestCategory.total})
          </div>
        </div>
      )}

      {/* Referral comparison */}
      {(refApps > 0 || nonRefApps > 0) && (
        <div className="js-card" style={{ padding: 24 }}>
          <SectionHeader icon={Users} title="Referral Impact" subtitle="How much does a referral change your interview rate?" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
            <ComparisonBar label="With Referral" rate={refInterviewRate} count={refApps} color="#386641" />
            <ComparisonBar label="Without Referral" rate={nonRefInterviewRate} count={nonRefApps} color="#8a8578" />
          </div>
          {refApps > 0 && nonRefApps > 0 && (
            <p style={{ marginTop: 18, fontSize: 14, color: "#5a5348", fontStyle: "italic", fontFamily: "inherit" }}>
              {refInterviewRate > nonRefInterviewRate
                ? `Referrals give you a ${refInterviewRate - nonRefInterviewRate} percentage point boost. Keep asking.`
                : refInterviewRate === nonRefInterviewRate
                ? `Same rate either way so far — the sample is still small.`
                : `Non-referral applications are performing better right now — possibly small sample.`}
            </p>
          )}
        </div>
      )}

      {/* Breakdown by role type */}
      <div className="js-card" style={{ padding: 24 }}>
        <SectionHeader icon={Target} title="Performance by Role Category" subtitle="Which categories respond most? Ranked by interview rate." />
        <div style={{ marginTop: 20, height: Math.max(240, roleTypeData.length * 50) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleTypeData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d3c3" horizontal={false} />
              <XAxis type="number" stroke="#5a5348" style={{ fontSize: 11, fontFamily: "JetBrains Mono" }} unit="%" />
              <YAxis type="category" dataKey="name" stroke="#5a5348" width={140} style={{ fontSize: 12, fontFamily: "Fraunces" }} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "none", color: "#f4f1ea", fontFamily: "JetBrains Mono", fontSize: 12 }}
                formatter={(val, name, props) => [`${val}% (${props.payload.interview}/${props.payload.total})`, "Interview Rate"]}
              />
              <Bar dataKey="interviewRate" fill="#bc6c25" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {roleTypeData.map(r => (
            <div key={r.name} style={{ padding: "10px 14px", background: "#f4f1ea", borderLeft: "3px solid #bc6c25" }}>
              <div className="fraunces" style={{ fontSize: 15, fontWeight: 600 }}>{r.name}</div>
              <div className="mono" style={{ fontSize: 11, color: "#5a5348", marginTop: 4 }}>
                {r.total} APPS · {r.responseRate}% REPLY · {r.interviewRate}% INTERVIEW
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="js-card" style={{ padding: 24 }}>
        <SectionHeader icon={Briefcase} title="Pipeline Distribution" subtitle="Where all your applications currently sit." />
        <div style={{ marginTop: 20, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d3c3" />
              <XAxis dataKey="stage" stroke="#5a5348" style={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <YAxis stroke="#5a5348" style={{ fontSize: 11, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "none", color: "#f4f1ea", fontFamily: "JetBrains Mono", fontSize: 12 }} />
              <Bar dataKey="count">
                {funnel.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 1 && (
        <div className="js-card" style={{ padding: 24 }}>
          <SectionHeader icon={Calendar} title="Application Velocity" subtitle="How many applications you're sending per week." />
          <div style={{ marginTop: 20, height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9d3c3" />
                <XAxis dataKey="week" stroke="#5a5348" style={{ fontSize: 11, fontFamily: "JetBrains Mono" }} />
                <YAxis stroke="#5a5348" style={{ fontSize: 11, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "none", color: "#f4f1ea", fontFamily: "JetBrains Mono", fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#bc6c25" strokeWidth={2.5} dot={{ fill: "#1a1a1a", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail, color }) {
  return (
    <div className="js-card" style={{ padding: 20, borderLeft: `4px solid ${color}` }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#5a5348", marginBottom: 10, fontWeight: 600 }}>{label.toUpperCase()}</div>
      <div className="fraunces" style={{ fontSize: 40, fontWeight: 600, lineHeight: 1, color: "#1a1a1a", letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#5a5348", marginTop: 8, fontStyle: "italic" }}>{detail}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
      <Icon size={20} strokeWidth={1.5} style={{ color: "#bc6c25", marginTop: 4 }} />
      <div>
        <h3 className="fraunces" style={{ fontSize: 22, fontWeight: 600, margin: 0, fontStyle: "italic", letterSpacing: "-0.01em" }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#5a5348", margin: "4px 0 0" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function ComparisonBar({ label, rate, count, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "#5a5348", fontWeight: 600 }}>{label.toUpperCase()}</span>
        <span className="mono" style={{ fontSize: 11, color: "#8a8578" }}>n={count}</span>
      </div>
      <div style={{ position: "relative", height: 48, background: "#f4f1ea", border: "1px solid #d9d3c3" }}>
        <div style={{ position: "absolute", inset: 0, width: `${Math.min(rate, 100)}%`, background: color, transition: "width 0.4s ease" }} />
        <div className="fraunces" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 14, fontSize: 22, fontWeight: 700, color: rate > 10 ? "#f4f1ea" : "#1a1a1a", mixBlendMode: rate > 10 ? "normal" : "normal" }}>
          {rate}%
        </div>
      </div>
    </div>
  );
}

function ContactView({ contact, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const hasAnyInfo = Object.values(contact).some(v => v && v.trim());

  if (!hasAnyInfo && !editing) {
    return <EmptyState icon={Mail} title="No contact info yet" body="Add your name, email, LinkedIn, and a short bio. Recruiters or referrers who see this dashboard will know how to reach you." cta="Add your info" onCta={() => setEditing(true)} />;
  }

  if (editing) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 className="fraunces" style={{ fontSize: 28, margin: 0, fontStyle: "italic", fontWeight: 600 }}>Edit Contact Info</h2>
          <button className="js-btn-primary" onClick={() => setEditing(false)}>Done</button>
        </div>
        <div className="js-card" style={{ padding: 28, display: "grid", gap: 16 }}>
          <Field label="Full Name"><input className="js-input" value={contact.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="Jane Doe" /></Field>
          <Field label="Headline"><input className="js-input" value={contact.headline} onChange={(e) => onUpdate({ headline: e.target.value })} placeholder="Aspiring Business Analyst · IU Kelley '26" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Email"><input className="js-input" type="email" value={contact.email} onChange={(e) => onUpdate({ email: e.target.value })} placeholder="you@email.com" /></Field>
            <Field label="Phone"><input className="js-input" value={contact.phone} onChange={(e) => onUpdate({ phone: e.target.value })} placeholder="(555) 555-5555" /></Field>
          </div>
          <Field label="Location"><input className="js-input" value={contact.location} onChange={(e) => onUpdate({ location: e.target.value })} placeholder="Bloomington, IN · open to relocation" /></Field>
          <Field label="LinkedIn URL"><input className="js-input" value={contact.linkedin} onChange={(e) => onUpdate({ linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." /></Field>
          <Field label="Portfolio / Website"><input className="js-input" value={contact.portfolio} onChange={(e) => onUpdate({ portfolio: e.target.value })} placeholder="https://..." /></Field>
          <Field label="Short Bio"><textarea className="js-input" rows={4} value={contact.bio} onChange={(e) => onUpdate({ bio: e.target.value })} placeholder="A couple of sentences about your background and what you're looking for." /></Field>
        </div>
      </div>
    );
  }

  // Display mode - formal business card
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="js-btn-ghost" onClick={() => setEditing(true)}>Edit</button>
      </div>
      <div style={{ background: "#fbf9f3", border: "2px solid #1a1a1a", boxShadow: "12px 12px 0 #1a1a1a", padding: "48px 56px" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.25em", color: "#bc6c25", marginBottom: 20, fontWeight: 600 }}>
          ── CONTACT ──
        </div>
        {contact.name && (
          <h1 className="fraunces" style={{ fontSize: 52, margin: 0, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            {contact.name}
          </h1>
        )}
        {contact.headline && (
          <div className="fraunces" style={{ fontSize: 20, fontStyle: "italic", color: "#5a5348", marginTop: 8, fontWeight: 400 }}>
            {contact.headline}
          </div>
        )}

        {contact.bio && (
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#1a1a1a", marginTop: 28, marginBottom: 0, maxWidth: 580, fontFamily: "inherit" }}>
            {contact.bio}
          </p>
        )}

        <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid #d9d3c3", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {contact.email && <ContactRow label="Email" value={contact.email} href={`mailto:${contact.email}`} />}
          {contact.phone && <ContactRow label="Phone" value={contact.phone} href={`tel:${contact.phone.replace(/\D/g, "")}`} />}
          {contact.location && <ContactRow label="Location" value={contact.location} />}
          {contact.linkedin && <ContactRow label="LinkedIn" value={contact.linkedin.replace(/^https?:\/\//, "")} href={contact.linkedin} />}
          {contact.portfolio && <ContactRow label="Portfolio" value={contact.portfolio.replace(/^https?:\/\//, "")} href={contact.portfolio} />}
        </div>
      </div>
    </div>
  );
}

function ContactRow({ label, value, href }) {
  const content = (
    <>
      <div className="mono" style={{ fontSize: 10, letterSpacing: "0.15em", color: "#8a8578", marginBottom: 4, fontWeight: 600 }}>{label.toUpperCase()}</div>
      <div className="fraunces" style={{ fontSize: 16, color: "#1a1a1a", wordBreak: "break-word" }}>{value}</div>
    </>
  );
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit", borderBottom: "1px solid transparent" }} onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = "#bc6c25"} onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = "transparent"}>{content}</a>;
  return <div>{content}</div>;
}

function PortfolioView({ items, onAdd, onUpdate, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterTag, setFilterTag] = useState("All");

  const allTags = useMemo(() => {
    const s = new Set();
    items.forEach(i => (i.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort();
  }, [items]);

  const filtered = filterTag === "All" ? items : items.filter(i => (i.tags || []).includes(filterTag));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <p className="fraunces" style={{ fontSize: 16, color: "#5a5348", margin: 0, fontStyle: "italic", maxWidth: 540 }}>
          Projects, experience, coursework, accomplishments — anything worth showing a recruiter lives here.
        </p>
        <button className="js-btn-primary" onClick={onAdd}><Plus size={16} /> Add Entry</button>
      </div>

      {allTags.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: "#5a5348", marginRight: 4 }}>FILTER:</span>
          <button
            onClick={() => setFilterTag("All")}
            className="mono"
            style={{ fontSize: 11, padding: "4px 10px", letterSpacing: "0.08em", color: filterTag === "All" ? "#f4f1ea" : "#5a5348", background: filterTag === "All" ? "#1a1a1a" : "transparent", border: "1px solid #1a1a1a", textTransform: "uppercase", fontWeight: 600 }}
          >
            All · {items.length}
          </button>
          {allTags.map(t => (
            <button
              key={t}
              onClick={() => setFilterTag(t)}
              className="mono"
              style={{ fontSize: 11, padding: "4px 10px", letterSpacing: "0.08em", color: filterTag === t ? "#f4f1ea" : "#5a5348", background: filterTag === t ? "#1a1a1a" : "transparent", border: "1px solid #c9c2b0", textTransform: "uppercase", fontWeight: 600 }}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Award} title="No entries yet" body="Add your first portfolio entry — a class project, internship, case competition, dashboard you built, anything worth highlighting." cta="Add your first" onCta={onAdd} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Filter} title="No matches" body={`Nothing tagged #${filterTag}. Clear the filter to see everything.`} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {filtered.map(item => (
            <PortfolioCard key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function PortfolioCard({ item, expanded, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  const save = () => {
    onUpdate(item.id, { title: draft.title, description: draft.description, url: draft.url, tags: typeof draft.tags === "string" ? draft.tags.split(",").map(t => t.trim()).filter(Boolean) : draft.tags });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="js-card" style={{ padding: 20, display: "grid", gap: 12 }}>
        <Field label="Title"><input className="js-input" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
        <Field label="Description"><textarea className="js-input" rows={4} value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
        <Field label="Tags (comma separated)"><input className="js-input" value={Array.isArray(draft.tags) ? draft.tags.join(", ") : (draft.tags || "")} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} /></Field>
        <Field label="Link"><input className="js-input" value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></Field>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <button className="js-btn-ghost" onClick={() => { if (confirm("Delete this entry?")) onDelete(item.id); }} style={{ color: "#9b2226" }}>
            <Trash2 size={14} /> Delete
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="js-btn-ghost" onClick={() => { setDraft(item); setEditing(false); }}>Cancel</button>
            <button className="js-btn-primary" onClick={save} style={{ padding: "6px 12px", fontSize: 12 }}>Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="js-card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 10, color: "#8a8578", letterSpacing: "0.1em" }}>
          {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#5a5348" }} title="Open link">
              <ExternalLink size={16} />
            </a>
          )}
          <button onClick={() => { setDraft(item); setEditing(true); }} className="js-btn-ghost" style={{ padding: 0, fontSize: 12 }}>Edit</button>
        </div>
      </div>
      <h3 className="fraunces" style={{ fontSize: 22, margin: "0 0 10px", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
        {item.title}
      </h3>
      {item.description && (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3a3a3a", margin: 0, flex: 1, display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.description}
        </p>
      )}
      {item.description && item.description.length > 200 && (
        <button onClick={onToggle} className="js-btn-ghost" style={{ padding: 0, marginTop: 8, fontSize: 12, textAlign: "left", color: "#bc6c25", fontWeight: 600 }}>
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
      {item.tags && item.tags.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed #c9c2b0", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {item.tags.map(t => (
            <span key={t} className="mono" style={{ fontSize: 10, color: "#5a5348", letterSpacing: "0.08em", padding: "3px 8px", background: "#f4f1ea", border: "1px solid #d9d3c3" }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AddPortfolioModal({ onClose, onSave }) {
  const [f, setF] = useState({ title: "", description: "", tags: "", url: "" });
  const submit = () => {
    if (!f.title.trim()) return;
    onSave({ title: f.title.trim(), description: f.description.trim(), url: f.url.trim(), tags: f.tags.split(",").map(t => t.trim()).filter(Boolean) });
  };
  return (
    <Modal title="Add Portfolio Entry" onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="Title *"><input className="js-input" autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Kelley Capstone · Retail Analytics Dashboard" /></Field>
        <Field label="Description"><textarea className="js-input" rows={5} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What it was, what you did, results, tools used..." /></Field>
        <Field label="Tags (comma separated)"><input className="js-input" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="sql, tableau, project, internship" /></Field>
        <Field label="Link (optional)"><input className="js-input" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://... (GitHub, Tableau Public, deck, etc.)" /></Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="js-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="js-btn-primary" onClick={submit}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

function EmptyState({ icon: Icon, title, body, cta, onCta }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", border: "1px dashed #c9c2b0", background: "#fbf9f3" }}>
      <Icon size={36} strokeWidth={1.2} style={{ color: "#8a8578", marginBottom: 16 }} />
      <h3 className="fraunces" style={{ fontSize: 24, margin: "0 0 8px", fontStyle: "italic", fontWeight: 500 }}>{title}</h3>
      <p style={{ color: "#5a5348", maxWidth: 420, margin: "0 auto 20px", fontSize: 15, lineHeight: 1.5 }}>{body}</p>
      {cta && <button className="js-btn-primary" onClick={onCta}><Plus size={16} /> {cta}</button>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,26,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#f4f1ea", padding: 32, maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", border: "2px solid #1a1a1a", boxShadow: "8px 8px 0 #1a1a1a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, borderBottom: "1px solid #1a1a1a", paddingBottom: 14 }}>
          <h2 className="fraunces" style={{ margin: 0, fontSize: 28, fontStyle: "italic", fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose}><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddAppModal({ onClose, onSave }) {
  const [f, setF] = useState({ company: "", role: "", roleType: "Business Analyst", location: "", url: "", stage: "Applied", notes: "", hasReferral: false, responseReceived: false });
  const submit = () => { if (!f.company || !f.role) return; onSave(f); };
  return (
    <Modal title="Log Application" onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="Company *"><input className="js-input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoFocus /></Field>
        <Field label="Role Title *"><input className="js-input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Category"><select className="js-input" value={f.roleType} onChange={(e) => setF({ ...f, roleType: e.target.value })}>{ROLE_TYPES.map(r => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Stage"><select className="js-input" value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></Field>
        </div>
        <Field label="Location"><input className="js-input" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Remote, Chicago, etc." /></Field>
        <Field label="Posting URL"><input className="js-input" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://..." /></Field>
        <Field label="Notes"><textarea className="js-input" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Referral name, recruiter, key points..." /></Field>
        <div style={{ display: "flex", gap: 20, padding: "6px 0" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={f.hasReferral} onChange={(e) => setF({ ...f, hasReferral: e.target.checked })} />
            Has a referral
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={f.responseReceived} onChange={(e) => setF({ ...f, responseReceived: e.target.checked })} />
            Got a response
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="js-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="js-btn-primary" onClick={submit}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

function AddSavedModal({ onClose, onSave }) {
  const [f, setF] = useState({ company: "", role: "", roleType: "Business Analyst", location: "", url: "", notes: "" });
  const submit = () => { if (!f.company || !f.role) return; onSave(f); };
  return (
    <Modal title="Save Listing" onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="Company *"><input className="js-input" value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} autoFocus /></Field>
        <Field label="Role Title *"><input className="js-input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Category"><select className="js-input" value={f.roleType} onChange={(e) => setF({ ...f, roleType: e.target.value })}>{ROLE_TYPES.map(r => <option key={r}>{r}</option>)}</select></Field>
          <Field label="Location"><input className="js-input" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        </div>
        <Field label="URL"><input className="js-input" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://..." /></Field>
        <Field label="Why this role"><textarea className="js-input" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="What caught your eye, deadline, fit..." /></Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="js-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="js-btn-primary" onClick={submit}>Save</button>
        </div>
      </div>
    </Modal>
  );
}

function AddPrepModal({ onClose, onSave }) {
  const [q, setQ] = useState("");
  const [tags, setTags] = useState("");
  const submit = () => { if (!q.trim()) return; onSave({ q: q.trim(), tags: tags.split(",").map(t => t.trim()).filter(Boolean) }); };
  return (
    <Modal title="Add Prep Question" onClose={onClose}>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="Question *"><textarea className="js-input" rows={3} value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="e.g. Walk me through a dashboard you built..." /></Field>
        <Field label="Tags (comma separated)"><input className="js-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="behavioral, sql, case" /></Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button className="js-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="js-btn-primary" onClick={submit}>Add</button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }) {
  return <div><label className="js-label">{label}</label>{children}</div>;
}
