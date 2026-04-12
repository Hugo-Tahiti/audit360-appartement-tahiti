export const metadata = {
  title: "Estimation Appartement Tahiti · Gratuit",
  description: "Découvre la valeur de ton appartement à Tahiti. 4 questions, résultat immédiat.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: "#0A0A0A" }}>
        <div id="initial-loader" style={{
          position: "fixed", inset: 0, background: "#0A0A0A",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          zIndex: 9999, transition: "opacity 0.3s",
        }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#ED1C24", letterSpacing: -1, marginBottom: 12 }}>kw</div>
          <div style={{ fontSize: 13, color: "#888", letterSpacing: 2, marginBottom: 28 }}>ESTIMATION APPARTEMENT</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "#ED1C24",
                animation: `bounce 1.2s ${i*0.2}s ease-in-out infinite`,
              }} />
            ))}
          </div>
          <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
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
