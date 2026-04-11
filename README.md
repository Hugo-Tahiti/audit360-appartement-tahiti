# audit360-tahiti

Funnel de qualification appartement · Keller Williams Polynésie · Hugo Vidus

---

## Déploiement Vercel — 5 étapes

### 1. GitHub
- github.com → New repository → nom : **audit360-tahiti** → Public → Create
- Upload tous les fichiers de ce dossier (drag & drop)

### 2. Vercel
- vercel.com → Add New Project → importe **audit360-tahiti**
- Framework : Next.js (détecté automatiquement)
- Clique Deploy

### 3. Clé API (obligatoire)
- Vercel → ton projet → Settings → Environment Variables
- Name : `ANTHROPIC_API_KEY`
- Value : ta clé `sk-ant-xxx` (console.anthropic.com)
- Save → Redeploy

### 4. Ton numéro WhatsApp
Dans `app/page.js` ligne 5 :
```js
const WA_NUMBER = "68987799385"; // remplace par ton numéro sans + ni espaces
```

### 5. Nom de domaine (optionnel mais recommandé)
Dans Vercel → Settings → Domains → ajoute un domaine custom.
Options :
- `audit360-tahiti.com` (~10€/an sur ovh.com)
- `estimation-appartement-tahiti.com`
- Ou utilise un sous-domaine si tu as déjà kwpolynesie.com

---

## Récupérer les leads

Les coordonnées de chaque lead sont visibles dans :
**Vercel → ton projet → Logs (onglet Functions)**

Format : `NOUVEAU LEAD { prenom, nom, tel, email, commune, surface, projet, probleme }`

Pour ne rien perdre : active les alertes email dans Vercel → Settings → Notifications.

---

## Personnalisation

| Fichier | Ligne | Ce qu'on change |
|---------|-------|----------------|
| `app/page.js` | 5 | Numéro WhatsApp |
| `app/page.js` | 7-13 | Liste des communes |
| `app/api/analyze/route.js` | tout | Prompt et ton style |
| `public/hugo.png` | — | Ta photo (déjà incluse) |

---

## Coût
- Vercel : gratuit
- GitHub : gratuit  
- API : ~0,003€ par lead analysé

Hugo Vidus · KW Polynésie · RSAC F82558
