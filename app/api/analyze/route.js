export async function POST(req) {
  const { answers, contact } = await req.json();

  const SURFACE = {
    moins50: "studio ou T2 (moins de 50 m²)",
    "50_80": "T2 ou T3 (50 à 80 m²)",
    "80_120": "T3 ou T4 (80 à 120 m²)",
    plus120: "grand appartement ou prestige (plus de 120 m²)",
  };
  const PROJET = {
    maintenant: "veut vendre le plus vite possible",
    sixmois: "veut vendre dans les 6 prochains mois",
    estimer: "veut d'abord savoir ce que ça vaut",
    reflechit: "réfléchit encore",
  };
  const PROBLEME = {
    charges:   "a des charges impayées ou des appels de charges trimestriels en retard",
    ag:        "a des PV d'AG manquants ou des travaux votés non encore soldés",
    reglement: "n'a pas le règlement de copropriété ou il n'est pas à jour",
    aucun:     "pense que son dossier est complet",
  };

  const system = `Tu es Hugo Vidus, conseiller immobilier chez Keller Williams Polynésie. Tu parles directement à un propriétaire d'appartement à Tahiti.

TON STYLE : Direct, simple, chaleureux. Tu tutoies. Pas de jargon compliqué. Phrases courtes. Tahiti est ton terrain.

RISQUES RÉELS APPARTEMENT EN PF (source : procédures KW Polynésie) :
- PV d'AG des 3 dernières années obligatoires → travaux votés, procédures en cours
- Charges impayées (appels trimestriels) → déduites du prix de vente le jour de l'acte
- Règlement de copropriété manquant ou non à jour → notaire bloque l'acte
- Titre de propriété incomplet → chaîne de propriété rompue, indivision non résolue
- Diagnostics (DPE, amiante, plomb, électricité) : NON REQUIS en Polynésie française
Taux de réussite avec dossier complet : 95% vs 60% sans préparation
Délai de vente : 3-6 mois vs 6-12 mois sans audit

RÉPONDS UNIQUEMENT EN JSON :
{
  "score": <entier 72-95>,
  "titre": "<phrase courte et directe, max 12 mots, avec prénom et commune>",
  "risque": "<le risque principal en 2 phrases simples, sans jargon>",
  "opportunite": "<pourquoi c'est le bon moment ou la bonne démarche, 2 phrases>",
  "action": "<1 seule chose concrète à faire maintenant, très simple>",
  "accroche": "<1 phrase finale qui donne envie de prendre RDV, ton Hugo>"
}`;

  const user = `Prénom : ${contact.prenom}
Commune : ${answers.commune}
Surface : ${SURFACE[answers.surface] || answers.surface}
Projet : ${PROJET[answers.projet] || answers.projet}
Problème : ${PROBLEME[answers.probleme] || answers.probleme}

JSON uniquement.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();

  // Log lead to console (visible in Vercel logs)
  console.log("NOUVEAU LEAD", {
    date: new Date().toISOString(),
    prenom: contact.prenom,
    nom: contact.nom,
    tel: contact.tel,
    email: contact.email,
    commune: answers.commune,
    surface: answers.surface,
    projet: answers.projet,
    probleme: answers.probleme,
  });

  try {
    return Response.json(JSON.parse(clean));
  } catch {
    return Response.json({ error: "parse", raw: clean }, { status: 500 });
  }
}
