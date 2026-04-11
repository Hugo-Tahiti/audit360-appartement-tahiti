"use client";
import { useState, useEffect, useRef } from "react";

const WA_NUMBER = "68987799385"; // ← TON NUMÉRO ICI

const COMMUNES = [
  "Papeete","Faa'a","Punaauia","Pirae","Arue","Mahina",
  "Paea","Papara","Taravao","Tiarei","Hitiaa O Te Ra","Papeari","Autre commune",
];

// ── Questions du quiz ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: "projet",
    question: "Dans combien de temps tu veux vendre ton appartement ?",
    emoji: "🎯",
    options: [
      { value: "maintenant", label: "Le plus vite possible", sub: "J'ai un projet concret", icon: "🔥", hot: true },
      { value: "sixmois",    label: "Dans les 6 mois",       sub: "Je me prépare",         icon: "📅" },
      { value: "estimer",    label: "Je veux d'abord savoir ce que ça vaut", sub: "Estimation gratuite", icon: "🔍" },
      { value: "reflechit",  label: "Je réfléchis encore",   sub: "Pas de pression",       icon: "💭" },
    ],
  },
  {
    id: "probleme",
    question: "Est-ce que l'un de ces points te concerne ?",
    emoji: "⚠️",
    sub: "C'est ce qui bloque 4 ventes sur 10 en Polynésie.",
    options: [
      { value: "charges",   label: "Charges impayées",          sub: "Appels de charges en retard",   icon: "💸" },
      { value: "ag",        label: "PV d'AG manquants",          sub: "Ou travaux votés non soldés",   icon: "📄" },
      { value: "reglement", label: "Règlement de copropriété",   sub: "Introuvable ou pas à jour",     icon: "📋" },
      { value: "aucun",     label: "Rien de tout ça",            sub: "Mon dossier est complet",       icon: "✅" },
    ],
  },
  {
    id: "commune",
    question: "Ton appartement est dans quelle commune ?",
    emoji: "📍",
    sub: "Les prix varient jusqu'à +35% selon la commune.",
    type: "select",
  },
  {
    id: "surface",
    question: "Quelle est la taille de ton appartement ?",
    emoji: "📐",
    options: [
      { value: "moins50", label: "Studio ou T2",     sub: "Moins de 50 m²",    icon: "🔲" },
      { value: "50_80",   label: "T2 ou T3",         sub: "50 à 80 m²",        icon: "🔳" },
      { value: "80_120",  label: "T3 ou T4",         sub: "80 à 120 m²",       icon: "⬛" },
      { value: "plus120", label: "Grand appartement", sub: "Plus de 120 m²",   icon: "🏙️" },
    ],
  },
];

// ── Couleurs ──────────────────────────────────────────────────────────────────
const RED = "#ED1C24";
const BLACK = "#0A0A0A";
const DARK = "#141414";
const BORDER = "#222";

// ── Barre de progression ──────────────────────────────────────────────────────
function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 5 }}>
        <span style={{ color: "#fff", fontWeight: 600 }}>Question {step}/{total}</span>
        <span style={{ color: RED, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "#1A1A1A", borderRadius: 99 }}>
        <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${RED},#FF5555)`, width: `${pct}%`, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ── Étape quiz ────────────────────────────────────────────────────────────────
function QuizStep({ step, idx, total, onAnswer }) {
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(false); setSel(null); setTimeout(() => setShow(true), 40); }, [idx]);

  const pick = (val) => { setSel(val); setTimeout(() => onAnswer(step.id, val), 320); };

  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)", transition: "all 0.3s" }}>
      <ProgressBar step={idx + 1} total={total} />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{step.emoji}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: step.sub ? 6 : 0 }}>
          {step.question}
        </div>
        {step.sub && <div style={{ fontSize: 13, color: "#777", fontStyle: "italic" }}>{step.sub}</div>}
      </div>

      {step.type === "select" ? (
        <select onChange={e => e.target.value && pick(e.target.value)} style={{
          width: "100%", padding: "18px 16px", borderRadius: 14,
          background: DARK, border: `2px solid ${BORDER}`, color: "#fff",
          fontSize: 16, cursor: "pointer", outline: "none",
        }}>
          <option value="">— Choisis ta commune —</option>
          {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {step.options.map(opt => (
            <button key={opt.value} onClick={() => pick(opt.value)} style={{
              background: sel === opt.value ? RED : DARK,
              border: `2px solid ${sel === opt.value ? RED : opt.hot ? RED : BORDER}`,
              borderRadius: 14, padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              transform: sel === opt.value ? "scale(0.98)" : "scale(1)",
            }}>
              <span style={{ fontSize: 26, minWidth: 32 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: sel === opt.value ? "rgba(255,255,255,0.7)" : "#666" }}>{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Champ de formulaire (hors composant pour éviter le re-render) ─────────────
function Field({ k, label, ph, type = "text", value, error, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 5, fontWeight: 700, letterSpacing: 0.5 }}>
        {label} <span style={{ color: RED }}>*</span>
      </label>
      <input
        type={type}
        value={value}
        placeholder={ph}
        onChange={e => onChange(k, e.target.value)}
        inputMode={type === "tel" ? "tel" : type === "email" ? "email" : "text"}
        autoComplete={type === "tel" ? "tel" : type === "email" ? "email" : k === "prenom" ? "given-name" : k === "nom" ? "family-name" : "off"}
        autoCorrect="off"
        autoCapitalize={type === "email" || type === "tel" ? "off" : "words"}
        style={{
          width: "100%", padding: "15px 14px", borderRadius: 12, fontSize: 16,
          background: error ? "#1A0A0A" : DARK,
          border: `2px solid ${error ? RED : BORDER}`,
          color: "#fff", outline: "none", boxSizing: "border-box",
          transition: "border-color 0.2s", WebkitAppearance: "none",
        }}
        onFocus={e => e.target.style.borderColor = RED}
        onBlur={e => e.target.style.borderColor = error ? RED : BORDER}
      />
      {error && <div style={{ fontSize: 11, color: RED, marginTop: 3 }}>⚠ {error}</div>}
    </div>
  );
}

// ── Formulaire contact ────────────────────────────────────────────────────────
function ContactForm({ answers, onSubmit }) {
  const [form, setForm] = useState({ prenom: "", nom: "", tel: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 40); }, []);

  const isHot = answers.projet === "maintenant";

  const handleChange = (k, val) => {
    setForm(prev => ({ ...prev, [k]: val }));
    setErrors(prev => ({ ...prev, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Requis";
    if (!form.nom.trim()) e.nom = "Requis";
    if (form.tel.replace(/\D/g, "").length < 6) e.tel = "Numéro invalide";
    if (!form.email.includes("@")) e.email = "Email invalide";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    onSubmit(form);
  };

  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)", transition: "all 0.3s" }}>
      {/* Barre progression finale */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 5 }}>
          <span style={{ color: "#fff", fontWeight: 600 }}>Dernière étape</span>
          <span style={{ color: RED, fontWeight: 700 }}>95%</span>
        </div>
        <div style={{ height: 5, background: "#1A1A1A", borderRadius: 99 }}>
          <div style={{ height: "100%", borderRadius: 99, background: `linear-gradient(90deg,${RED},#FF5555)`, width: "95%", transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Teaser */}
      <div style={{ background: "#1A0505", border: `1px solid ${RED}33`, borderLeft: `4px solid ${RED}`, borderRadius: 12, padding: "16px 18px", marginBottom: 22 }}>
        <div style={{ fontSize: 12, color: RED, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>
          {isHot ? "🔥 PROFIL VENDEUR PRIORITAIRE" : "📊 TON RÉSULTAT EST PRÊT"}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          {isHot ? "Ton estimation personnalisée est calculée." : "Je t'envoie ton analyse dans la seconde."}
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>Entre tes coordonnées pour la recevoir 👇</div>
      </div>

      <form onSubmit={e => { e.preventDefault(); submit(); }} autoComplete="on" noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
          <Field k="prenom" label="PRÉNOM" ph="Marie" value={form.prenom} error={errors.prenom} onChange={handleChange} />
          <Field k="nom" label="NOM" ph="Dupont" value={form.nom} error={errors.nom} onChange={handleChange} />
        </div>
        <Field k="tel" label="TÉLÉPHONE / WHATSAPP" ph="+689 87 XX XX XX" type="tel" value={form.tel} error={errors.tel} onChange={handleChange} />
        <Field k="email" label="EMAIL" ph="marie@example.com" type="email" value={form.email} error={errors.email} onChange={handleChange} />

        <button type="submit" disabled={loading} style={{
          width: "100%", background: loading ? "#333" : RED,
          color: "#fff", border: "none", borderRadius: 14,
          padding: "20px 24px", fontSize: 17, fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          marginTop: 6, marginBottom: 14,
          boxShadow: loading ? "none" : `0 4px 24px ${RED}55`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "all 0.2s",
        }}>
          {loading
            ? <><span style={{ display: "inline-block", animation: "spin 0.7s linear infinite" }}>⟳</span> Calcul en cours…</>
            : "Voir mon estimation →"}
        </button>
      </form>

      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
        {["🔒 Données confidentielles", "⚡ Résultat immédiat", "💯 100% gratuit"].map(t => (
          <div key={t} style={{ fontSize: 11, color: "#555", background: "#111", borderRadius: 20, padding: "4px 10px", border: "1px solid #1E1E1E" }}>{t}</div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Chargement ────────────────────────────────────────────────────────────────
function Loading({ prenom }) {
  const msgs = ["Analyse du dossier en cours…", "Vérification des risques copropriété…", "Calcul de la valeur du marché…", "Préparation de ton résultat…"];
  const [i, setI] = useState(0);
  useEffect(() => { const iv = setInterval(() => setI(n => (n + 1) % msgs.length), 1400); return () => clearInterval(iv); }, []);

  return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ width: 70, height: 70, borderRadius: "50%", overflow: "hidden", margin: "0 auto 20px", border: `3px solid ${RED}` }}>
        <img src="/hugo.png" alt="Hugo" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Hugo analyse ton dossier…</div>
      <div style={{ fontSize: 13, color: "#777", marginBottom: 24, minHeight: 20, fontStyle: "italic" }}>{msgs[i]}</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[0,1,2].map(j => (
          <div key={j} style={{ width: 10, height: 10, borderRadius: "50%", background: RED, animation: `bounce 1.2s ${j * 0.2}s ease-in-out infinite` }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

// ── Page résultat ─────────────────────────────────────────────────────────────
function ResultPage({ result, answers, contact }) {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => setShow(true), 80);
    let n = 0; const target = result.score || 90;
    const iv = setInterval(() => { n += 2; if (n >= target) { setCount(target); clearInterval(iv); } else setCount(n); }, 22);
    return () => clearInterval(iv);
  }, []);

  const SLABELS = { moins50: "studio / T2", "50_80": "T2 / T3", "80_120": "T3 / T4", plus120: "appartement prestige" };
  const surface = SLABELS[answers.surface] || "appartement";
  const waMsg = encodeURIComponent(`Bonjour Hugo, je m'appelle ${contact.prenom} ${contact.nom}. J'ai un ${surface} à ${answers.commune} et je voudrais une estimation gratuite.`);
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  return (
    <div style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(16px)", transition: "all 0.5s" }}>

      {/* Score */}
      <div style={{ background: "linear-gradient(135deg,#1A1A1A,#0D0D0D)", borderRadius: 16, padding: "22px 20px", marginBottom: 14, border: "1px solid #2A2A2A", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `radial-gradient(circle,${RED} 1px,transparent 1px)`, backgroundSize: "18px 18px" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#666", marginBottom: 8 }}>
            {contact.prenom.toUpperCase()}, TON RÉSULTAT
          </div>
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1, background: `linear-gradient(135deg,${RED},#FF6B6B)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>
            {count}%
          </div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>de chances de vendre au prix demandé avec un dossier complet</div>
          <div style={{ background: `${RED}15`, border: `1px solid ${RED}33`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{result.titre}</div>
          </div>
        </div>
      </div>

      {/* Hugo + message */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", background: DARK, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px", marginBottom: 12 }}>
        <img src="/hugo.png" alt="Hugo Vidus" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: `2px solid ${RED}`, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 12, color: RED, fontWeight: 700, marginBottom: 4 }}>HUGO VIDUS · KW POLYNÉSIE</div>
          <div style={{ fontSize: 14, color: "#ddd", lineHeight: 1.6, fontStyle: "italic" }}>"{result.accroche}"</div>
        </div>
      </div>

      {/* Risque */}
      {result.risque && (
        <div style={{ background: "#1A0A0A", borderLeft: `4px solid ${RED}`, borderRadius: "0 10px 10px 0", border: `1px solid ${RED}33`, borderLeft: `4px solid ${RED}`, padding: "14px 16px", marginBottom: 10, fontSize: 14, color: "#ccc", lineHeight: 1.6 }}>
          ⚠️ <strong style={{ color: RED }}>Point de vigilance — </strong>{result.risque}
        </div>
      )}

      {/* Opportunité */}
      {result.opportunite && (
        <div style={{ background: "#111", borderRadius: 10, padding: "12px 16px", marginBottom: 10, fontSize: 14, color: "#aaa", lineHeight: 1.6, border: `1px solid ${BORDER}` }}>
          📊 {result.opportunite}
        </div>
      )}

      {/* Action immédiate */}
      {result.action && (
        <div style={{ background: "#0A160A", border: "1px solid #1A3A1A", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontSize: 14, color: "#bbb", lineHeight: 1.6 }}>
          ✅ <strong style={{ color: "#4CAF50" }}>À faire maintenant — </strong>{result.action}
        </div>
      )}

      {/* Ce que comprend l'audit */}
      <div style={{ background: DARK, borderRadius: 12, padding: "16px 18px", marginBottom: 18, border: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 12 }}>TON AUDIT GRATUIT COMPREND</div>
        {[
          "Vérification PV d'AG des 3 dernières années",
          "Contrôle des charges & appels trimestriels",
          "Validation règlement de copropriété",
          "Vérification titre de propriété & chaîne de propriété",
          "Estimation sur ventes réelles (pas les prix affichés)",
          "Rapport remis sous 72h — 0 F CFP",
        ].map(item => (
          <div key={item} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 14, color: "#ccc" }}>
            <span style={{ color: RED, fontWeight: 700 }}>✔</span><span>{item}</span>
          </div>
        ))}
      </div>

      {/* CTA WhatsApp */}
      <a href={waLink} target="_blank" rel="noreferrer" style={{
        display: "block", background: "#25D366", color: "#fff", textDecoration: "none",
        borderRadius: 14, padding: "20px 24px", textAlign: "center", marginBottom: 14,
        boxShadow: "0 4px 24px rgba(37,211,102,0.4)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>💬 Réserver mon audit gratuit →</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>Réponse sous 2h · 0 engagement · 0 F CFP</div>
      </a>

      {/* Garanties */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {["🔒 Confidentiel", "⏱ Réponse en 2h", "💯 Gratuit"].map(t => (
          <div key={t} style={{ fontSize: 11, color: "#555", background: "#111", borderRadius: 20, padding: "4px 12px", border: "1px solid #1E1E1E" }}>{t}</div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ background: "#0F0F0F", borderRadius: 10, padding: "10px 14px", border: "1px solid #1A1A1A", fontSize: 11, color: "#444", textAlign: "center" }}>
        <span style={{ color: RED, fontWeight: 700 }}>Hugo Vidus</span> · Keller Williams Polynésie · RSAC F82558 · +689 87 79 93 85
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// APP
// ═════════════════════════════════════════════════════════════════════════════
export default function Page() {
  const [phase, setPhase]     = useState("quiz");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState(null);
  const [result, setResult]   = useState(null);
  const top = useRef(null);

  useEffect(() => { top.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [phase, stepIdx]);

  const onAnswer = (id, val) => {
    const a = { ...answers, [id]: val };
    setAnswers(a);
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else setPhase("contact");
  };

  const onContact = async (data) => {
    setContact(data);
    setPhase("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, contact: data }),
      });
      const json = await res.json();
      if (json.error) throw new Error();
      setResult(json);
      setPhase("result");
    } catch {
      setPhase("error");
    }
  };

  const isQuiz = phase === "quiz";
  const isContact = phase === "contact";

  return (
    <div style={{ minHeight: "100vh", background: BLACK, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", overflowY: "auto" }} ref={top}>

      {/* Header */}
      <div style={{ background: "#0D0D0D", borderBottom: "1px solid #1A1A1A", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: RED, letterSpacing: -0.5, lineHeight: 1 }}>kw</div>
          <div style={{ width: 1, height: 20, background: "#222" }} />
          <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, lineHeight: 1 }}>ESTIMATION APPARTEMENT</div>
        </div>
        {(isQuiz || isContact) && (
          <div style={{ fontSize: 11, color: RED, fontWeight: 700 }}>
            {isContact ? "Dernière étape" : `${stepIdx + 1} / ${STEPS.length}`}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* Trust bar quiz/contact */}
        {(isQuiz || isContact) && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {["⏱ 45 secondes", "🔒 Confidentiel", "💯 Gratuit"].map(t => (
              <div key={t} style={{ fontSize: 11, color: "#555", background: "#111", borderRadius: 20, padding: "4px 12px", border: "1px solid #1A1A1A" }}>{t}</div>
            ))}
          </div>
        )}

        {phase === "quiz" && (
          <QuizStep step={STEPS[stepIdx]} idx={stepIdx} total={STEPS.length} onAnswer={onAnswer} />
        )}
        {phase === "contact" && (
          <ContactForm answers={answers} onSubmit={onContact} />
        )}
        {phase === "loading" && <Loading prenom={contact?.prenom} />}
        {phase === "result" && result && (
          <ResultPage result={result} answers={answers} contact={contact} />
        )}
        {phase === "error" && (
          <div style={{ background: "#1A0505", border: `2px solid ${RED}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
            <div style={{ color: RED, fontWeight: 700, marginBottom: 8 }}>Erreur de connexion</div>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Vérifiez que ANTHROPIC_API_KEY est bien configurée dans Vercel.</div>
            <button onClick={() => { setPhase("quiz"); setStepIdx(0); setAnswers({}); }}
              style={{ background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
              Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
