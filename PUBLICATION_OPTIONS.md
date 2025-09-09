# 🚀 Options de Publication - PayGate JS SDK

## 📊 **Situation Actuelle**

✅ **Code 100% Prêt** - SDK validé et corrigé  
✅ **Packages Renommés** - Scope `@filanodev/` configuré  
✅ **Workflows Créés** - GitHub Actions configuré  
❌ **Problème Dépendances** - Permissions WSL + versions conflits  

## 🔧 **3 Options de Publication**

### Option 1: GitHub Actions Automatisé (Recommandé)

**Étapes :**
1. Configurez `NPM_TOKEN` dans GitHub Secrets
2. Créez un tag de version :
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Le workflow `simple-publish.yml` se déclenche automatiquement

**Avantages :** 
- ✅ Automatique
- ✅ Pas de problème de permissions local
- ✅ Publication simultanée de tous les packages

### Option 2: Publication Manuelle via NPM CLI

**Prérequis :**
```bash
npm login  # Connexion à votre compte filanodev
```

**Commandes :**
```bash
# Publier chaque package individuellement
cd packages/core && npm publish --access public
cd ../react && npm publish --access public  
cd ../vue && npm publish --access public
cd ../nuxt && npm publish --access public
cd ../next && npm publish --access public
```

### Option 3: Environnement Linux Natif

Si les permissions WSL posent problème :
1. Copiez le code sur un serveur Linux
2. Exécutez `pnpm install && pnpm build && pnpm publish`

## 🎯 **Publication Recommandée (Option 1)**

### 1. Token NPM
- Allez sur https://npmjs.com
- Créez l'organisation `filanodev` 
- Générez un token **Automation**
- Ajoutez-le dans GitHub Secrets comme `NPM_TOKEN`

### 2. Créer Release
```bash
# Taguer et pousser
git tag v1.0.0
git push origin v1.0.0

# OU directement sur GitHub
# Releases → Create new release → v1.0.0
```

### 3. Vérifier Publication
```bash
# Vérifier que les packages sont disponibles
npm view @filanodev/paygate-core
npm view @filanodev/paygate-react
npm view @filanodev/paygate-vue
npm view @filanodev/paygate-nuxt  
npm view @filanodev/paygate-next
```

## 📦 **Structure des Packages Finaux**

```
@filanodev/paygate-core@0.1.0    # Base SDK
@filanodev/paygate-react@0.1.0   # React hooks
@filanodev/paygate-vue@0.1.0     # Vue composables  
@filanodev/paygate-nuxt@1.0.0    # Nuxt module
@filanodev/paygate-next@1.0.0    # Next.js plugin
```

## 🔍 **Test d'Installation**

Une fois publié, testez :
```bash
mkdir test-install
cd test-install
npm init -y
npm install @filanodev/paygate-core

# Test d'import
node -e "console.log(require('@filanodev/paygate-core'))"
```

## 🎉 **Post-Publication**

1. **Annonce** sur les communautés dev
2. **Documentation** sur GitHub Pages
3. **Exemples** dans des repositories séparés
4. **Badges** NPM dans le README

---

**🚀 Le SDK est prêt ! Choisissez votre méthode de publication préférée.**