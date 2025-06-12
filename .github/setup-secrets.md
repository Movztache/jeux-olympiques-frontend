# 🔐 Configuration des Secrets GitHub Actions

Ce guide vous aide à configurer les secrets nécessaires pour le déploiement automatique.

## 📋 Prérequis

1. **Compte AWS** avec permissions administratives
2. **Repository GitHub** avec accès aux paramètres
3. **AWS CLI** installé (optionnel, pour vérification)

## 🔑 Création d'un utilisateur AWS pour GitHub Actions

### 1. Connexion à la console AWS
- Connectez-vous à [AWS Console](https://console.aws.amazon.com)
- Naviguez vers **IAM** > **Utilisateurs**

### 2. Création de l'utilisateur
```bash
# Nom d'utilisateur suggéré
github-actions-vibe-ticket
```

### 3. Politique IAM requise

Créez une politique personnalisée avec les permissions suivantes :

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:*"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:GetRole",
                "iam:PassRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:ListRolePolicies",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRolePolicy"
            ],
            "Resource": "*"
        }
    ]
}
```

### 4. Génération des clés d'accès
- Sélectionnez l'utilisateur créé
- Onglet **Informations d'identification de sécurité**
- **Créer une clé d'accès** > **Application s'exécutant en dehors d'AWS**
- **Télécharger le fichier .csv** ou noter les clés

## 🔧 Configuration des Secrets GitHub

### 1. Accès aux paramètres
- Allez sur votre repository GitHub
- **Settings** > **Secrets and variables** > **Actions**

### 2. Ajout des secrets

Cliquez sur **New repository secret** pour chaque secret :

#### AWS_ACCESS_KEY_ID
```
Nom: AWS_ACCESS_KEY_ID
Valeur: AKIA... (votre clé d'accès AWS)
```

#### AWS_SECRET_ACCESS_KEY
```
Nom: AWS_SECRET_ACCESS_KEY
Valeur: wJalrXUt... (votre clé secrète AWS)
```

## ✅ Vérification de la configuration

### Test des credentials AWS (optionnel)

Si vous avez AWS CLI installé :

```bash
# Configuration temporaire pour test
export AWS_ACCESS_KEY_ID="votre-access-key"
export AWS_SECRET_ACCESS_KEY="votre-secret-key"
export AWS_DEFAULT_REGION="eu-west-3"

# Test de connexion
aws sts get-caller-identity

# Test des permissions S3
aws s3 ls

# Test des permissions CloudFront
aws cloudfront list-distributions
```

### Vérification dans GitHub
1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Vérifiez que les deux secrets sont listés :
   - ✅ `AWS_ACCESS_KEY_ID`
   - ✅ `AWS_SECRET_ACCESS_KEY`

## 🚀 Premier déploiement

Une fois les secrets configurés :

1. **Commit et push** sur la branche `main`
2. Le workflow se déclenche automatiquement
3. Surveillez l'exécution dans **Actions**

### Commandes Git pour déclencher le déploiement :

```bash
# Ajout des nouveaux fichiers GitHub Actions
git add .github/

# Commit des changements
git commit -m "🚀 Add GitHub Actions CI/CD workflow for frontend deployment"

# Push vers main pour déclencher le déploiement
git push origin main
```

## 🔍 Surveillance du déploiement

### Logs en temps réel
- **GitHub** : Onglet **Actions** > Sélectionner le workflow en cours
- **AWS CloudWatch** : Logs des services AWS (optionnel)

### URLs de vérification
Après déploiement réussi, vérifiez :
- **S3** : Console AWS > S3 > Votre bucket
- **CloudFront** : Console AWS > CloudFront > Votre distribution

## 🚨 Dépannage

### Erreur "Access Denied"
- Vérifiez les permissions IAM de l'utilisateur
- Vérifiez que les secrets GitHub sont correctement configurés

### Erreur "Bucket already exists"
- Le nom de bucket S3 doit être unique globalement
- Terraform gère cela automatiquement avec un suffixe aléatoire

### Erreur de build Angular
- Vérifiez que `package.json` est à jour
- Vérifiez les dépendances dans le workflow

## 📞 Support

En cas de problème :
1. Consultez les logs dans GitHub Actions
2. Vérifiez la configuration AWS
3. Contactez l'équipe DevOps

---

🎯 **Prêt pour le déploiement automatique de Vibe-ticket !**
