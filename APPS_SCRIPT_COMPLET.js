// ─── SCRIPT APPS SCRIPT COMPLET — LEADS KW + DASHBOARD ─────────────────────
// Colle tout ce code dans Apps Script → Enregistre → Déployer Nouvelle version

function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action;
    
    if (action === "getData") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      
      // Feuille Leads
      const leadsSheet = ss.getSheetByName("Leads") || ss.getSheets()[0];
      const leadsData = leadsSheet.getDataRange().getValues();
      const leadsHeaders = leadsData[0];
      // Mapping exact des colonnes du Sheet vers les clés du dashboard
      const HEADER_MAP = {
        "date":      "date",
        "prénom":    "prenom",
        "prenom":    "prenom",
        "nom":       "nom",
        "téléphone": "tel",
        "telephone": "tel",
        "email":     "email",
        "commune":   "commune",
        "surface":   "surface",
        "projet":    "projet",
        "problème":  "probleme",
        "probleme":  "probleme",
        "score":     "score",
      };

      const leads = leadsData.slice(1).map(row => {
        const obj = {};
        leadsHeaders.forEach((h, i) => {
          const key = HEADER_MAP[String(h).toLowerCase().trim()] || String(h).toLowerCase().trim();
          obj[key] = row[i];
        });
        return obj;
      }).filter(l => l.prenom || l.nom);

      // Feuille Tracking
      let tracking = [];
      const trackSheet = ss.getSheetByName("Tracking");
      if (trackSheet) {
        const trackData = trackSheet.getDataRange().getValues();
        const trackHeaders = trackData[0];
        tracking = trackData.slice(1).map(row => {
          const obj = {};
          trackHeaders.forEach((h, i) => { obj[h] = row[i]; });
          return obj;
        });
      }

      return ContentService
        .createTextOutput(JSON.stringify({ leads, tracking }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Tracking events (quiz_start, step_complete, etc.)
    if (data._track) {
      let trackSheet = ss.getSheetByName("Tracking");
      if (!trackSheet) {
        trackSheet = ss.insertSheet("Tracking");
        trackSheet.appendRow(["Event", "Step", "Value", "Timestamp"]);
      }
      trackSheet.appendRow([
        data.event || '',
        data.step || '',
        data.value || '',
        data.timestamp || new Date().toISOString(),
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Lead normal
    const leadsSheet = ss.getSheetByName("Leads") || ss.getSheets()[0];
    
    // Déterminer la source du lead
    const source = data.rappel === 'callback_form' ? 'Formulaire rappel' :
                   data.rappel === 'result_view' ? 'Rapport vu' :
                   data.rappel || 'Quiz complet';
    
    leadsSheet.appendRow([
      new Date().toLocaleString('fr-FR'),
      data.prenom || '',
      data.nom || '',
      data.tel || '',
      data.email || '',
      data.commune || '',
      data.surface || '',
      data.projet || '',
      data.probleme || '',
      data.score || '',
      source,
    ]);
    console.log("Sheet OK");

    // Sujet email selon la source
    const isCallbackForm = data.rappel === 'callback_form';
    const isResultView = data.rappel === 'result_view';
    
    const sujet = isCallbackForm
      ? '🔥 Rappel demandé - ' + (data.prenom || '?') + ' - ' + (data.commune || '?') + ' - ' + (data.projet || '?')
      : isResultView
      ? '👁 Rapport vu - ' + (data.commune || '?') + ' - ' + (data.surface || '?') + ' - ' + (data.projet || '?')
      : '📋 Nouveau lead - ' + (data.prenom || '?') + ' - ' + (data.commune || '?');

    const urgence = isCallbackForm
      ? '⚡ A RAPPELER EN PRIORITÉ'
      : isResultView
      ? '👁 A surveiller — rapport consulté sans laisser de coordonnées'
      : '📋 Lead à contacter';

    // Email notification Hugo
    GmailApp.sendEmail(
      'hugo@kwpolynesie.com',
      sujet,
      urgence + '\n\n' +
      'Source : ' + source + '\n' +
      'Prénom : ' + (data.prenom || '-') + '\n' +
      'Tél : ' + (data.tel || '-') + '\n' +
      'Email : ' + (data.email || '-') + '\n' +
      'Commune : ' + (data.commune || '-') + '\n' +
      'Surface : ' + (data.surface || '-') + '\n' +
      'Projet : ' + (data.projet || '-') + '\n' +
      'Problème : ' + (data.probleme || '-') + '\n' +
      'Score : ' + (data.score || '-') + '\n\n' +
      (isCallbackForm ? 'Ce prospect a demandé à être rappelé — contacte-le rapidement.' :
       isResultView ? 'Ce prospect a consulté son rapport complet sans laisser ses coordonnées.' :
       'Lead à contacter.'),
      { replyTo: 'hugo@kwpolynesie.com' }
    );
    console.log("Email Hugo OK");

    // Email au lead
    if (data.email && data.email.includes('@')) {
      GmailApp.sendEmail(
        data.email,
        'Ton estimation pour ton appartement à Tahiti - Hugo Vidus KW Polynésie',
        'Ia ora na ' + data.prenom + ',\n\n' +
        'J\'ai bien reçu ta demande pour ton appartement à ' + data.commune + '.\n\n' +
        'Je te recontacte très prochainement pour convenir d\'un rendez-vous d\'estimation gratuit à ton domicile.\n\n' +
        'Tu peux également me joindre directement :\n' +
        'Tél / WhatsApp : 87 79 93 85\n' +
        'Email : hugo@kwpolynesie.com\n\n' +
        'À très bientôt,\n\n' +
        'Hugo VIDUS\n' +
        'Conseiller Immobilier\n' +
        'Keller Williams Polynésie\n' +
        'RSAC : F82558\n' +
        '──────────────────────\n' +
        'Tél : 87 79 93 85\n' +
        'hugo@kwpolynesie.com\n' +
        'www.kwpolynesie.com\n' +
        'Centre Puea Pahonu - Rue Bovis - Fare Ute - 98714 PAPEETE',
        { replyTo: 'hugo@kwpolynesie.com', name: 'Hugo Vidus - KW Polynésie' }
      );
      console.log("Email lead OK - envoyé à : " + data.email);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    console.log("ERREUR : " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testEmail() {
  GmailApp.sendEmail(
    'hugo.vidus@gmail.com',
    'Test email script KW',
    'Si tu reçois cet email, le script Gmail fonctionne.'
  );
  console.log("Email envoyé");
}
