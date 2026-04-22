export const metadata = {
  title: "Estimation Appartement Tahiti — Rapport Gratuit en 45 Secondes | Hugo Vidus KW Polynésie",
  description: "Tu vends ton appartement à Tahiti ? Reçois ton rapport complet gratuitement en 45 secondes. Diagnostic dossier, valeur indicative du marché, plan d'action concret. Hugo Vidus — Conseiller Immobilier KW Polynésie — Papeete, Punaauia, Pirae, Arue, Faa'a, Mahina.",
  keywords: "agent immobilier Tahiti, estimation appartement Tahiti, vendre appartement Tahiti, conseiller immobilier Papeete, estimation gratuite Tahiti, KW Polynésie, Hugo Vidus, diagnostic dossier vente Tahiti",
  openGraph: {
    title: "Estimation Appartement Tahiti — Rapport Gratuit en 45 Secondes",
    description: "Tu vends ton appartement à Tahiti ? Reçois ton rapport complet gratuitement. Diagnostic, valeur indicative, plan d'action. Hugo Vidus — KW Polynésie.",
    url: "https://mon-appart-tahiti.vercel.app",
    siteName: "Mon Appart Tahiti — KW Polynésie",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estimation Appartement Tahiti — Gratuit en 45 Secondes",
    description: "Rapport complet sur ton dossier de vente. Hugo Vidus — KW Polynésie.",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: "#0A0A0A" }}>
        {/* Écran de chargement instantané — visible avant React */}
        <div id="initial-loader" style={{
          position: "fixed", inset: 0, background: "#0A0A0A",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          zIndex: 9999, transition: "opacity 0.3s",
        }}>
          <div style={{
            fontSize: 28, fontWeight: 900, color: "#ED1C24",
            letterSpacing: -1, marginBottom: 12,
          }}>kw</div>
          <div style={{
            fontSize: 13, color: "#888", letterSpacing: 2,
            marginBottom: 28,
          }}>ESTIMATION APPARTEMENT</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#ED1C24",
                animation: `bounce 1.2s ${i*0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
          <style>{`
            @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
          `}</style>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            var loader = document.getElementById('initial-loader');
            if (loader) {
              loader.style.opacity = '0';
              setTimeout(function(){ loader.style.display = 'none'; }, 350);
            }
          });
        `}} />
        {children}
      </body>
    </html>
  );
}
