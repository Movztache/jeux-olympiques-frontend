# 🚀 Déploiement Frontend Angular avec Terraform

Ce dossier contient la configuration Terraform pour déployer votre application Angular sur AWS en utilisant S3 + CloudFront.

## 📋 Architecture

```
Frontend Angular → Build → S3 Bucket → CloudFront → Utilisateurs
```

- **S3** : Stockage des fichiers statiques (HTML, CSS, JS)
- **CloudFront** : CDN global pour la performance (HTTP)
- **OAC** : Origin Access Control pour sécuriser l'accès S3

## 🛠️ Prérequis

1. **AWS CLI configuré** avec vos identifiants
2. **Terraform installé** (version >= 1.0)
3. **Application Angular buildée** (`ng build --configuration=production`)

## 🚀 Déploiement

### Étape 1 : Initialisation Terraform
```bash
cd terraform/frontend
terraform init
```

### Étape 2 : Planification
```bash
terraform plan
```

### Étape 3 : Déploiement
```bash
terraform apply
```

### Étape 4 : Upload des fichiers
```bash
# Build de l'application Angular
ng build --configuration=production

# Synchronisation avec S3 (remplacez BUCKET_NAME par la valeur de l'output)
aws s3 sync dist/jeux-olympiques-frontend/ s3://BUCKET_NAME/ --delete

# Invalidation du cache CloudFront (remplacez DISTRIBUTION_ID)
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## 📝 Configuration

### Variables importantes dans `terraform.tfvars` :

- `aws_region` : Région AWS (défaut: eu-west-1)
- `project_name` : Nom du projet (défaut: vibe-ticket)
- `backend_api_url` : URL de votre API backend
- `cloudfront_default_ttl` : Cache HTML (défaut: 1h)
- `cloudfront_assets_ttl` : Cache assets (défaut: 1 an)

## 📤 Outputs

Après le déploiement, Terraform affichera :
- `application_url` : URL HTTP de votre application
- `s3_bucket_name` : Nom du bucket S3
- `cloudfront_distribution_id` : ID pour les invalidations
- `deployment_commands` : Commandes pour déployer

## 🔄 Mise à jour de l'application

```bash
# 1. Build
ng build --configuration=production

# 2. Upload
aws s3 sync dist/vibe-ticket-frontend/ s3://BUCKET_NAME/ --delete

# 3. Invalidation cache
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

## 🗑️ Suppression

```bash
terraform destroy
```

⚠️ **Attention** : Cela supprimera définitivement toutes les ressources créées.
