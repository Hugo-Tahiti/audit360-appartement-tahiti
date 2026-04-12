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
      const leads = leadsData.slice(1).map(row => {
        const obj = {};
        leadsHeaders.forEach((h, i) => {
          obj[String(h).toLowerCase().replace(/é/g, 'e').replace(/è/g, 'e').replace(/ê/g, 'e').replace(/\s/g, '_')] = row[i];
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
    ]);
    console.log("Sheet OK");

    // Email notification Hugo
    GmailApp.sendEmail(
      'hugo@kwpolynesie.com',
      'Nouveau lead - ' + data.prenom + ' ' + data.nom + ' - ' + data.commune,
      'Nouveau lead reçu :\n\nPrénom : ' + data.prenom + '\nNom : ' + data.nom + '\nTél : ' + data.tel + '\nEmail : ' + data.email + '\nCommune : ' + data.commune + '\nSurface : ' + data.surface + '\nProjet : ' + data.projet + '\nProblème : ' + data.probleme + '\nScore : ' + data.score + '\n\nA contacter rapidement.',
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
