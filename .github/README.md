# GitHub Actions CI/CD - Vibe-ticket Frontend

Ce dossier contient la configuration GitHub Actions pour le déploiement automatique du frontend Angular de Vibe-ticket sur AWS.

## Vue d'ensemble

Le workflow automatise complètement le déploiement de l'application Angular sur AWS avec :
- **Build** automatique de l'application Angular 19
- **Déploiement** de l'infrastructure AWS avec Terraform (S3 + CloudFront)
- **Upload** de l'application sur S3
- **Invalidation** du cache CloudFront

## Configuration requise

### Secrets GitHub à configurer

Dans les paramètres de votre repository GitHub (`Settings > Secrets and variables > Actions`), ajoutez :

| Secret | Description | Comment obtenir |
|--------|-------------|-----------------|
| `AWS_ACCESS_KEY_ID` | Clé d'accès AWS | `aws configure get aws_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète AWS | `aws configure get aws_secret_access_key` |

### Permissions AWS requises

L'utilisateur AWS doit avoir les permissions suivantes :
- **S3** : Création/gestion de buckets, upload de fichiers
- **CloudFront** : Création/gestion de distributions, invalidation de cache
- **IAM** : Création de politiques pour CloudFront OAC

## Déclenchement du workflow

### Automatique
- **Push sur `main`** : Déploiement automatique complet

### Manuel
- **Workflow Dispatch** : Exécution manuelle depuis l'onglet Actions de GitHub

## Étapes du workflow

### 1. Build Angular Application
- Installation de Node.js 20
- Installation des dépendances (`npm ci`)
- Build de production (`npm run build`)
- Upload des artefacts de build

### 2. Deploy Infrastructure
- Configuration des credentials AWS
- Installation de Terraform 1.12.1
- Initialisation et validation Terraform
- Application de l'infrastructure (S3 + CloudFront)
- Commit automatique de l'état Terraform

### 3. Deploy Application to S3
- Téléchargement des artefacts de build
- Synchronisation avec S3 (avec optimisation du cache)
- Invalidation du cache CloudFront
- Affichage des URLs de déploiement

## URLs de déploiement

Après un déploiement réussi, l'application est accessible via :

- **S3 Direct** : `http://vibe-ticket-frontend-prod-[suffix].s3-website.eu-west-3.amazonaws.com`
- **CloudFront** : `http://[distribution-id].cloudfront.net`

## Gestion de l'état Terraform

**Stratégie simplifiée** : L'état Terraform est versionné dans le repository pour faciliter le déploiement.

### Avantages :
✅ **Simplicité** : Pas de configuration de backend distant  
✅ **Traçabilité** : État versionné avec le code  
✅ **Rollback facile** : Retour en arrière possible  
✅ **CI/CD simple** : Pas de configuration complexe  

## Premier déploiement

1. **Configurez les secrets GitHub** avec vos clés AWS
2. **Commitez et pushez** pour déclencher le déploiement :

```bash
git add .github/
git commit -m "Add GitHub Actions CI/CD workflow"
git push origin main
```

3. **Surveillez l'exécution** dans l'onglet **Actions** de GitHub

## Dépannage

### Échec du build Angular
- Vérifier les dépendances dans `package.json`
- Consulter les logs de build dans Actions

### Échec Terraform
- Vérifier les credentials AWS dans les secrets GitHub
- Vérifier les quotas AWS (buckets S3, distributions CloudFront)
- Consulter les logs Terraform dans Actions

### Échec du déploiement S3
- Vérifier les permissions S3
- Vérifier l'existence du bucket
- Consulter les logs AWS CLI dans Actions

---

**Objectif** : Déploiement automatisé, simple et fiable pour les Jeux Olympiques France 2025 !
