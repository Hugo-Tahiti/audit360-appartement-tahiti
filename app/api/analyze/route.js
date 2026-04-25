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
    estimer: "veut d'abord estimer la valeur de son bien",
    reflechit: "réfléchit encore à son projet de vente",
  };
  const PROBLEME = {
    charges:   "a des charges impayées ou des appels de charges trimestriels en retard",
    ag:        "a des PV d'AG manquants ou des travaux votés non encore soldés",
    reglement: "n'a pas le règlement de copropriété ou il n'est pas à jour",
    aucun:     "pense que son dossier est complet",
  };

  const MARCHE = {
    "Papeete":  "marché actif, forte demande locative, investisseurs présents, délai de vente 3-5 mois en moyenne pour un bien correctement estimé",
    "Faa'a":    "marché populaire, forte densité, acquéreurs primo-accédants nombreux, prix plus accessibles qu'à Papeete, délai 4-6 mois",
    "Punaauia": "marché premium côte ouest, acquéreurs CSP+, expatriés, villas et résidences sécurisées, délai 4-7 mois selon standing",
    "Pirae":    "marché résidentiel calme, familial, bonne demande pour les T3/T4, proximité Papeete appréciée, délai 4-6 mois",
    "Arue":     "marché tranquille, peu d'offres disponibles, acquéreurs cherchant calme et vue mer, délai 5-8 mois",
    "Mahina":   "marché moins tendu, prix attractifs, acquéreurs locaux principalement, délai 6-10 mois",
  };

  const marcheInfo = MARCHE[answers.commune] || "marché local actif, conditions à vérifier selon le quartier précis";

  // Prénom propre — on ignore les placeholders techniques
  const prenomBrut = contact.prenom || "";
  const placeholders = ["ami", "toi", "non renseigné", "moana", "test", ""];
  const prenomPropre = placeholders.includes(prenomBrut.toLowerCase()) ? null : prenomBrut;

  const system = `Tu es Hugo Vidus, conseiller immobilier chez Keller Williams Polynésie. Tu rédiges un rapport personnalisé et exclusif pour un propriétaire d'appartement à Tahiti qui vient de faire son bilan dossier en ligne.

TON STYLE : Direct, professionnel, chaleureux. Tu tutoies. Phrases courtes et percutantes. Tu donnes des informations concrètes que les agences classiques ne donnent pas. Ton rapport doit faire la différence — le propriétaire doit se dire "je n'ai jamais reçu ça d'une agence".

RÈGLES ABSOLUES :
- Tu te bases UNIQUEMENT sur les faits listés ci-dessous
- Tu ne cites JAMAIS de statistiques, délais ou taux qui ne sont pas dans ce prompt
- En cas de doute sur un point réglementaire, tu dis "à vérifier lors du RDV"
- Tu ne mentionnes JAMAIS la DAACT ni les diagnostics (DPE, amiante, électricité, plomb) — NON REQUIS en Polynésie française
- Tu ne parles JAMAIS d'état daté
- Chaque section doit être SPÉCIFIQUE à la situation du propriétaire — pas de généralités
- Si le prénom fourni est absent ou générique, NE PAS utiliser de prénom dans le rapport. Adresse-toi directement sans prénom (ex: "Ton dossier..." plutôt que "Marie, ton dossier...")

DOCUMENTS OBLIGATOIRES VENTE APPARTEMENT PF :
1. Titre de propriété complet (chaîne de propriété DAF)
2. Dernier avis de taxe foncière
3. Pièces d'identité de tous les propriétaires
4. Règlement de copropriété et ses modificatifs
5. 3 derniers PV d'Assemblée Générale
6. 3 derniers appels trimestriels de charges OU dernier état de répartition des charges annuelles
7. Carnet d'entretien de l'immeuble
8. Plans si disponibles

RISQUES BLOQUANTS :
- Charges impayées → déduites prix de vente chez le notaire, intérêts qui courent
- PV d'AG manquants → travaux votés inconnus, litiges cachés, acquéreur peut se rétracter
- Règlement copro manquant → notaire peut bloquer l'acte
- Titre propriété incomplet → chaîne de propriété à reconstituer à la DAF (long et coûteux)

RÉPONDS UNIQUEMENT EN JSON avec ces champs exacts :
{
  "score": <entier entre 45 et 92 selon gravité du problème : aucun=85-92, reglement=68-75, ag=58-68, charges=45-58>,
  "titre": "<phrase accrocheuse max 10 mots, sans prénom si non fourni, commune + situation>",
  "diagnostic": "<2-3 phrases : état réel du dossier, ce qui va et ce qui ne va pas, SPÉCIFIQUE au problème déclaré>",
  "risque_principal": "<si problème détecté : conséquence concrète et chiffrée si possible. Si aucun problème : point de vigilance à anticiper quand même>",
  "marche_local": "<2 phrases sur le marché de SA commune spécifiquement : demande, profil acheteurs, timing>",
  "plan_action": ["<action 1 concrète à faire cette semaine>", "<action 2 concrète>", "<action 3 concrète>"],
  "avantage_concurrentiel": "<ce que son appartement a pour lui dans ce marché : surface, localisation, timing>",
  "message_hugo": "<message personnel d'Hugo, 2 phrases max, direct et humain, donne envie du RDV, sans prénom si non fourni>"
}`;

  const user = `Prénom : ${prenomPropre || "non renseigné"}
Commune : ${answers.commune}
Surface : ${SURFACE[answers.surface] || answers.surface}
Projet : ${PROJET[answers.projet] || answers.projet}
Problème dossier : ${PROBLEME[answers.probleme] || answers.probleme}
Marché local : ${marcheInfo}

Génère un rapport personnalisé exclusif. JSON uniquement, pas de markdown.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();

  // Envoi vers Google Sheets
  try {
    await fetch(process.env.GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom:   prenomPropre || "",
        nom:      contact.nom,
        tel:      contact.tel,
        email:    contact.email,
        commune:  answers.commune,
        surface:  answers.surface,
        projet:   answers.projet,
        probleme: answers.probleme,
        score:    JSON.parse(clean).score || "",
        rappel:   contact.rappel || "",
      }),
    });
  } catch(e) {
    console.error("Google Sheets error:", e);
  }

  console.log("NOUVEAU LEAD", {
    date: new Date().toISOString(),
    prenom: prenomPropre || "(anonyme)",
    tel: contact.tel,
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
