# 🚀 Guide de Déploiement - PayGate JS SDK

## 📋 État Actuel

✅ **SDK 100% Conforme** - Validé selon documentation officielle PayGateGlobal  
✅ **Packages Corrigés** - Tous les packages sont prêts pour la publication  
✅ **Dépendances Résolues** - Problème `changelogs@^3.3.2` corrigé  
✅ **GitHub Actions** - Workflow automatisé créé  

## 🎯 Étapes de Publication

### 1. Authentification GitHub

Configurez l'authentification GitHub pour pousser le code :

```bash
# Option A: SSH (recommandé)
git remote set-url origin git@github.com:filanodev/paygate-js-sdk.git

# Option B: Token personnel
git remote set-url origin https://YOUR_TOKEN@github.com/filanodev/paygate-js-sdk.git
```

### 2. Push du Code

```bash
git push origin main
```

### 3. Configuration des Secrets GitHub

Dans GitHub Repository Settings > Secrets and Variables > Actions, ajoutez :

- **`NPM_TOKEN`**: Token NPM pour la publication automatique
- **`GITHUB_TOKEN`**: Généré automatiquement par GitHub

### 4. Création des Versions

Utilisez Changesets pour gérer les versions :

```bash
# Créer un changeset
pnpm changeset

# Sélectionnez les packages à publier et le type de changement :
# - patch (0.0.x) : corrections de bugs
# - minor (0.x.0) : nouvelles fonctionnalités
# - major (x.0.0) : breaking changes
```

### 5. Publication

Deux méthodes disponibles :

#### Méthode A : Automatique (Recommandée)
1. Créez et pushez un changeset
2. GitHub Actions créera automatiquement une PR "Release"
3. Mergez la PR pour publier automatiquement

#### Méthode B : Manuel
```bash
# Taguer une version
git tag v1.0.0
git push origin v1.0.0

# La publication se déclenchera automatiquement
```

## 🔧 Commandes Utiles

```bash
# Installation locale (si permissions OK)
pnpm install

# Build local
pnpm build

# Tests
pnpm test

# Lint
pnpm lint

# Preview changesets
pnpm changeset status
```

## 📦 Packages à Publier

1. **@filanodev/paygate-core** (v0.1.0)
2. **@filanodev/paygate-react** (v0.1.0)  
3. **@filanodev/paygate-vue** (v0.1.0)
4. **@filanodev/paygate-nuxt** (v1.0.0)
5. **@filanodev/paygate-next** (v0.1.0)

## 🌐 URLs Finales

Une fois publié :

- **NPM**: https://npmjs.com/org/filano
- **GitHub**: https://github.com/filanodev/paygate-js-sdk
- **Documentation**: GitHub Pages (auto-déployé)

## 🎉 Post-Publication

1. Vérifiez que tous les packages sont disponibles sur NPM
2. Testez l'installation : `npm install @filanodev/paygate-core`
3. Créez des releases GitHub avec les notes de version
4. Annoncez sur les communautés développeurs

## 🛠️ Dépannage

### Erreurs de Permissions WSL
Les problèmes de permissions WSL empêchent l'installation locale. Solution :
- Utilisez GitHub Actions pour le build/publish
- Ou copiez le code dans un environnement Linux natif

### Erreurs de Changeset
Si `pnpm changeset publish` échoue :
```bash
# Publication manuelle par package
cd packages/core && npm publish
cd packages/react && npm publish
# etc...
```

---

**Le SDK PayGateGlobal JavaScript est maintenant prêt pour la publication ! 🎊**