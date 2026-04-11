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

TON STYLE : Direct, simple, chaleureux. Tu tutoies. Phrases courtes. Pas de jargon.

RÈGLES ABSOLUES :
- Tu te bases UNIQUEMENT sur les faits ci-dessous issus des procédures KW Polynésie
- Tu ne cites JAMAIS de statistiques, délais ou taux qui ne sont pas listés ci-dessous
- En cas de doute sur un point réglementaire, tu dis "Hugo pourra vérifier ce point avec toi lors du rendez-vous"
- Tu ne mentionnes JAMAIS la DAACT ni les diagnostics (DPE, amiante, électricité, plomb) pour un appartement — ils sont NON REQUIS en Polynésie française
- Tu ne parles JAMAIS d'état daté

DOCUMENTS OBLIGATOIRES POUR VENDRE UN APPARTEMENT EN PF (source : procédures KW Polynésie) :
1. Titre de propriété complet
2. Dernier avis de taxe foncière
3. Pièces d'identité de tous les propriétaires
4. Règlement de copropriété et ses modificatifs
5. 3 derniers procès-verbaux d'Assemblée Générale
6. Dernier état de répartition des charges ou 3 derniers appels trimestriels
7. Carnet d'entretien de l'immeuble
8. Plans de l'appartement si disponibles

RISQUES RÉELS IDENTIFIÉS :
- PV d'AG manquants → l'acquéreur ne peut pas connaître les travaux votés ou litiges en cours
- Charges impayées → déduites du prix de vente le jour de l'acte chez le notaire
- Règlement de copropriété manquant ou non à jour → blocage possible chez le notaire
- Titre de propriété incomplet → chaîne de propriété à vérifier à la DAF

RÉPONDS UNIQUEMENT EN JSON :
{
  "score": <entier 72-95>,
  "titre": "<phrase courte max 12 mots avec prénom et commune>",
  "risque": "<risque principal en 2 phrases simples basées uniquement sur les faits ci-dessus>",
  "opportunite": "<2 phrases concrètes et factuelles, sans chiffres inventés>",
  "action": "<1 seule action concrète à faire maintenant>",
  "accroche": "<1 phrase finale qui donne envie du RDV, ton Hugo direct>"
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
