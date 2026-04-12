"use client";
import { useState, useEffect } from "react";

const DASHBOARD_PASSWORD = "hugo2026"; // ← CHANGE CE MOT DE PASSE

const RED    = "#ED1C24";
const BLACK  = "#0A0A0A";
const DARK   = "#141414";
const DARK2  = "#1A1A1A";
const BORDER = "#222";
const WHITE  = "#fff";
const GREY   = "#888";

// ── Labels lisibles ───────────────────────────────────────────────────────────
const SURFACE_LABELS = {
  moins50: "Studio / T2",
  "50_80": "T2 / T3",
  "80_120": "T3 / T4",
  plus120: "Prestige",
};
const PROJET_LABELS = {
  maintenant: "Vendre vite",
  sixmois: "Dans 6 mois",
  estimer: "Estimer",
  reflechit: "Réfléchit",
};
const PROBLEME_LABELS = {
  charges: "Charges impayées",
  ag: "PV d'AG manquants",
  reglement: "Règlement copro",
  aucun: "Dossier complet",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Inconnu";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function sortDesc(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

// ── Composants UI ─────────────────────────────────────────────────────────────
function Card({ title, children, flex }) {
  return (
    <div style={{
      background: DARK, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: "18px 20px", flex: flex || "unset",
    }}>
      <div style={{ fontSize: 11, color: GREY, letterSpacing: 2, marginBottom: 14, fontWeight: 700 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function BigStat({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 52, fontWeight: 900, color: color || RED, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: GREY, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Bar({ label, count, max, color }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: WHITE }}>{label}</span>
        <span style={{ color: color || RED, fontWeight: 700 }}>{count}</span>
      </div>
      <div style={{ height: 6, background: DARK2, borderRadius: 99 }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: color || RED,
          width: `${pct}%`, transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

function LeadRow({ lead, idx }) {
  const SURFACE_SHORT = { moins50: "T2", "50_80": "T3", "80_120": "T4", plus120: "Prestige" };
  const isHot = lead.projet === "maintenant";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "24px 1fr 80px 70px 60px",
      gap: 12, padding: "10px 0",
      borderBottom: `1px solid ${BORDER}`,
      alignItems: "center",
    }}>
      <div style={{ fontSize: 11, color: GREY }}>{idx + 1}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>
          {lead.prenom} {lead.nom}
          {isHot && <span style={{ marginLeft: 6, fontSize: 10, color: RED, fontWeight: 800 }}>CHAUD</span>}
        </div>
        <div style={{ fontSize: 11, color: GREY }}>{lead.tel} · {lead.email}</div>
      </div>
      <div style={{ fontSize: 12, color: "#aaa" }}>{lead.commune}</div>
      <div style={{ fontSize: 12, color: "#aaa" }}>{SURFACE_SHORT[lead.surface] || lead.surface}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: RED }}>{lead.score || "—"}</div>
    </div>
  );
}

// ── App Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [leads, setLeads] = useState([]);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const login = () => {
    if (pwd === DASHBOARD_PASSWORD) {
      setAuth(true);
      loadData();
    } else {
      setPwdError(true);
      setTimeout(() => setPwdError(false), 2000);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard-data");
      const json = await res.json();
      setLeads(json.leads || []);
      setTracking(json.tracking || []);
      setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
    } catch {
      // fallback — no data
    }
    setLoading(false);
  };

  // ── Calculs stats ──────────────────────────────────────────────────────────
  const total = leads.length;
  const hot = leads.filter(l => l.projet === "maintenant").length;
  const avgScore = total > 0
    ? Math.round(leads.reduce((s, l) => s + (parseInt(l.score) || 0), 0) / total)
    : 0;

  const byCommune  = sortDesc(countBy(leads, "commune"));
  const byProjet   = sortDesc(countBy(leads, "projet"));
  const byProbleme = sortDesc(countBy(leads, "probleme"));
  const bySurface  = sortDesc(countBy(leads, "surface"));

  const maxCommune  = byCommune[0]?.[1]  || 1;
  const maxProjet   = byProjet[0]?.[1]   || 1;
  const maxProbleme = byProbleme[0]?.[1] || 1;
  const maxSurface  = bySurface[0]?.[1]  || 1;

  // Taux de complétion depuis tracking
  const starts   = tracking.filter(t => t.event === "quiz_start").length;
  const q2       = tracking.filter(t => t.event === "step_complete" && t.step === "projet").length;
  const q3       = tracking.filter(t => t.event === "step_complete" && t.step === "probleme").length;
  const q4       = tracking.filter(t => t.event === "step_complete" && t.step === "commune").length;
  const contacts = tracking.filter(t => t.event === "contact_reached").length;
  const submits  = total;

  const completionSteps = [
    { label: "Démarré le quiz",    count: starts   || total, ref: starts   || total },
    { label: "Q1 — Projet",        count: q2       || total },
    { label: "Q2 — Problème",      count: q3       || total },
    { label: "Q3 — Commune",       count: q4       || total },
    { label: "Formulaire atteint", count: contacts || total },
    { label: "Lead soumis",        count: submits },
  ];
  const maxStep = completionSteps[0].count || 1;

  // Leads récents (10 derniers)
  const recentLeads = [...leads].reverse().slice(0, 10);

  // ── Écran de login ─────────────────────────────────────────────────────────
  if (!auth) return (
    <div style={{
      minHeight: "100vh", background: BLACK,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Helvetica Neue',sans-serif",
    }}>
      <div style={{ width: 340, textAlign: "center" }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: RED, marginBottom: 4 }}>kw</div>
        <div style={{ fontSize: 13, color: GREY, letterSpacing: 2, marginBottom: 32 }}>DASHBOARD LEADS</div>

        <input
          type="password" placeholder="Mot de passe"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 10, fontSize: 15,
            background: DARK, border: `2px solid ${pwdError ? RED : BORDER}`,
            color: WHITE, outline: "none", boxSizing: "border-box", marginBottom: 12,
            transition: "border-color 0.2s",
          }}
        />
        {pwdError && (
          <div style={{ color: RED, fontSize: 12, marginBottom: 10 }}>Mot de passe incorrect</div>
        )}
        <button onClick={login} style={{
          width: "100%", background: RED, color: WHITE, border: "none",
          borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer",
        }}>
          Accéder au dashboard →
        </button>
      </div>
    </div>
  );

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: BLACK,
      fontFamily: "'Helvetica Neue',sans-serif", padding: "0 0 60px",
    }}>

      {/* Header */}
      <div style={{
        background: "#0D0D0D", borderBottom: `1px solid ${BORDER}`,
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: RED }}>kw</div>
          <div style={{ width: 1, height: 18, background: BORDER }} />
          <div style={{ fontSize: 11, color: GREY, letterSpacing: 1 }}>DEAL FLOW DASHBOARD</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {lastUpdate && <div style={{ fontSize: 11, color: GREY }}>Mis à jour {lastUpdate}</div>}
          <button onClick={loadData} style={{
            background: loading ? DARK : RED, color: WHITE, border: "none",
            borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>
            {loading ? "..." : "Actualiser"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* KPIs principaux */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { value: total,    label: "Leads total",       color: WHITE },
            { value: hot,      label: "Leads chauds",      color: RED },
            { value: `${avgScore}%`, label: "Score moyen", color: "#4CAF50" },
            { value: starts > 0 ? `${Math.round((total/starts)*100)}%` : "—",
              label: "Taux complétion", color: "#FF9800" },
          ].map(({ value, label, color }) => (
            <Card key={label}>
              <BigStat value={value} label={label} color={color} />
            </Card>
          ))}
        </div>

        {/* Taux de complétion par étape */}
        <Card title="ENTONNOIR — TAUX DE COMPLÉTION PAR ÉTAPE" flex="1">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 8 }}>
            {completionSteps.map((s, i) => {
              const pct = maxStep > 0 ? Math.round((s.count / maxStep) * 100) : 0;
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    height: 80, background: DARK2, borderRadius: 6,
                    display: "flex", alignItems: "flex-end", overflow: "hidden", marginBottom: 6,
                  }}>
                    <div style={{
                      width: "100%", background: i === 5 ? "#4CAF50" : RED,
                      height: `${pct}%`, transition: "height 0.6s ease",
                      borderRadius: "4px 4px 0 0",
                    }} />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: i === 5 ? "#4CAF50" : WHITE }}>
                    {s.count}
                  </div>
                  <div style={{ fontSize: 10, color: GREY, lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: i === 5 ? "#4CAF50" : RED, fontWeight: 700 }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{ height: 16 }} />

        {/* Stats 4 colonnes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>

          <Card title="LEADS PAR COMMUNE">
            {byCommune.slice(0, 8).map(([k, v]) => (
              <Bar key={k} label={k} count={v} max={maxCommune} />
            ))}
            {byCommune.length === 0 && <div style={{ color: GREY, fontSize: 13 }}>Aucune donnée</div>}
          </Card>

          <Card title="URGENCE DU PROJET">
            {byProjet.map(([k, v]) => (
              <Bar key={k} label={PROJET_LABELS[k] || k} count={v} max={maxProjet}
                color={k === "maintenant" ? RED : "#666"} />
            ))}
            {byProjet.length === 0 && <div style={{ color: GREY, fontSize: 13 }}>Aucune donnée</div>}
          </Card>

          <Card title="PROBLÈME IDENTIFIÉ">
            {byProbleme.map(([k, v]) => (
              <Bar key={k} label={PROBLEME_LABELS[k] || k} count={v} max={maxProbleme} />
            ))}
            {byProbleme.length === 0 && <div style={{ color: GREY, fontSize: 13 }}>Aucune donnée</div>}
          </Card>

          <Card title="SURFACE DES BIENS">
            {bySurface.map(([k, v]) => (
              <Bar key={k} label={SURFACE_LABELS[k] || k} count={v} max={maxSurface}
                color="#FF9800" />
            ))}
            {bySurface.length === 0 && <div style={{ color: GREY, fontSize: 13 }}>Aucune donnée</div>}
          </Card>

        </div>

        {/* Derniers leads */}
        <Card title="10 DERNIERS LEADS">
          {recentLeads.length === 0 ? (
            <div style={{ color: GREY, fontSize: 13 }}>Aucun lead pour le moment</div>
          ) : (
            <>
              {/* Header tableau */}
              <div style={{
                display: "grid", gridTemplateColumns: "24px 1fr 80px 70px 60px",
                gap: 12, paddingBottom: 8, borderBottom: `1px solid ${BORDER}`, marginBottom: 4,
              }}>
                {["#", "Contact", "Commune", "Surface", "Score"].map(h => (
                  <div key={h} style={{ fontSize: 10, color: GREY, fontWeight: 700, letterSpacing: 1 }}>{h}</div>
                ))}
              </div>
              {recentLeads.map((lead, i) => (
                <LeadRow key={i} lead={lead} idx={i} />
              ))}
            </>
          )}
        </Card>

      </div>
    </div>
  );
}
