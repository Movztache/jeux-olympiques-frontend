# 🚀 Guide de Démarrage Rapide - Vibe-Ticket Frontend

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **AWS CLI configuré** avec vos identifiants
   ```bash
   aws configure
   ```

2. **Terraform installé** (version >= 1.0)
   - Téléchargez depuis : https://www.terraform.io/downloads

3. **Angular CLI installé**
   ```bash
   npm install -g @angular/cli
   ```

## ⚡ Déploiement Rapide

### Option 1 : Script Automatisé (Recommandé)

**Windows (PowerShell) :**
```powershell
cd terraform/frontend
.\deploy.ps1 deploy
```

**Linux/Mac :**
```bash
cd terraform/frontend
./deploy.sh deploy
```

### Option 2 : Étapes Manuelles

1. **Aller dans le dossier Terraform**
   ```bash
   cd terraform/frontend
   ```

2. **Initialiser Terraform**
   ```bash
   terraform init
   ```

3. **Planifier le déploiement**
   ```bash
   terraform plan
   ```

4. **Appliquer les changements**
   ```bash
   terraform apply
   ```

5. **Builder l'application Angular**
   ```bash
   cd ../..
   ng build --configuration=production
   cd terraform/frontend
   ```

6. **Récupérer les informations de déploiement**
   ```bash
   # Nom du bucket S3
   terraform output s3_bucket_name

   # URL de l'application
   terraform output application_url

   # ID CloudFront pour les invalidations
   terraform output cloudfront_distribution_id
   ```

7. **Uploader les fichiers vers S3**
   ```bash
   aws s3 sync ../../dist/vibe-ticket-frontend/ s3://[BUCKET_NAME]/ --delete
   ```

8. **Invalider le cache CloudFront**
   ```bash
   aws cloudfront create-invalidation --distribution-id [DISTRIBUTION_ID] --paths "/*"
   ```

## 🔧 Configuration

### Personnaliser les variables

Modifiez le fichier `terraform.tfvars` :

```hcl
# Configuration AWS
aws_region   = "eu-west-1"
project_name = "vibe-ticket"
environment  = "prod"

# URL de votre API backend
backend_api_url = "http://13.36.187.182:8080/api"

# Configuration du cache CloudFront
cloudfront_default_ttl = 3600      # 1 heure pour HTML
cloudfront_assets_ttl  = 31536000  # 1 an pour les assets
```

## 📤 Résultats du Déploiement

Après un déploiement réussi, vous obtiendrez :

- **URL de l'application** : `http://xxxxxxxxx.cloudfront.net`
- **Bucket S3** : `vibe-ticket-frontend-prod-xxxxxxxx`
- **Distribution CloudFront** : `EXXXXXXXXXX`

## 🔄 Mises à Jour

Pour mettre à jour votre application :

```bash
# 1. Build
ng build --configuration=production

# 2. Upload (remplacez BUCKET_NAME)
aws s3 sync dist/vibe-ticket-frontend/ s3://BUCKET_NAME/ --delete

# 3. Invalidation cache (remplacez DISTRIBUTION_ID)
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

Ou utilisez le script :
```bash
./deploy.sh upload
```

## 🗑️ Suppression

Pour supprimer toute l'infrastructure :

```bash
terraform destroy
```

Ou avec le script :
```bash
./deploy.sh destroy
```

## 🆘 Dépannage

### Erreur "bucket already exists"
- Les noms de buckets S3 sont uniques globalement
- Le script génère automatiquement un suffixe aléatoire

### Erreur "access denied"
- Vérifiez vos identifiants AWS : `aws sts get-caller-identity`
- Assurez-vous d'avoir les permissions nécessaires

### Build Angular échoue
- Vérifiez que toutes les dépendances sont installées : `npm install`
- Vérifiez la version d'Angular : `ng version`

### CloudFront lent à se mettre à jour
- La propagation CloudFront peut prendre 5-15 minutes
- Utilisez l'invalidation de cache pour forcer la mise à jour

## 📞 Support

En cas de problème :
1. Vérifiez les logs Terraform
2. Consultez la console AWS
3. Vérifiez la configuration dans `terraform.tfvars`

## 🎯 Prochaines Étapes

Une fois le frontend déployé :
1. Notez l'URL de votre application
2. Configurez votre backend pour accepter les requêtes CORS depuis cette URL
3. Mettez à jour `backend_api_url` dans `terraform.tfvars` avec l'URL réelle de votre API
4. Redéployez avec `terraform apply`
