# CVE Explorer - NVD API Key Setup

## Configuration de la clé API NVD

L'application CVE Explorer utilise l'API NVD (National Vulnerability Database) du NIST pour récupérer les données de CVEs.

### Sans clé API (par défaut)
- ✅ Fonctionne directement
- ⚠️ Rate limite: ~6 requêtes/seconde
- ❌ Peut être limité en cas d'usage intensif

### Avec clé API (recommandé)
- ✅ Rate limite bien plus élevée
- ✅ Meilleure performance
- ✅ Gratuit

## Installation

1. **Obtenir une clé API gratuite:**
   - Allez sur https://nvd.nist.gov/developers/request-an-api-key
   - Remplissez le formulaire
   - Vous recevrez une clé par email

2. **Configurer la clé dans le projet:**
   - Ouvrez (ou créez) le fichier `.env.local` à la racine du projet
   - Ajoutez votre clé:
     ```
     VITE_NVD_API_KEY=votre_clé_api_ici
     ```

3. **Redémarrer le dev server:**
   ```bash
   npm run dev
   ```

## Notes

- ⚠️ Le fichier `.env.local` est **JAMAIS** commité (dans `.gitignore`)
- ✅ Voir `.env.example` pour un template
- 🔒 Gardez votre clé secrète (ne pas commit, ne pas partager)

## Vérification

Dans le navigateur, ouvrez la console (F12) et vérifiez:
- Sans clé: URL contient `?keywordSearch=...` (pas `apiKey`)
- Avec clé: URL contient `...&apiKey=your_key` (chiffré en HTTPS)

## Support

Pour des questions sur l'API NVD:
- Documentation: https://nvd.nist.gov/developers/vulnerabilities
- API Reference: https://nvd.nist.gov/developers/vulnerabilities
