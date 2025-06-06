#!/bin/bash

# =============================================================================
# SCRIPT DE VALIDATION - CONFIGURATION GITHUB ACTIONS
# Vérifie que tous les prérequis sont en place pour le déploiement
# =============================================================================

echo "🔍 Validation de la configuration GitHub Actions pour Vibe-ticket"
echo "=================================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
ERRORS=0
WARNINGS=0
SUCCESS=0

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((SUCCESS++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((ERRORS++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo ""
echo "📁 Vérification de la structure des fichiers..."
echo "------------------------------------------------"

# Vérification des fichiers GitHub Actions
if [ -f ".github/workflows/deploy.yml" ]; then
    print_result 0 "Workflow GitHub Actions présent"
else
    print_result 1 "Workflow GitHub Actions manquant"
fi

if [ -f ".github/README.md" ]; then
    print_result 0 "Documentation GitHub Actions présente"
else
    print_result 1 "Documentation GitHub Actions manquante"
fi

if [ -f ".github/setup-secrets.md" ]; then
    print_result 0 "Guide de configuration des secrets présent"
else
    print_result 1 "Guide de configuration des secrets manquant"
fi

echo ""
echo "🔧 Vérification de la configuration Terraform..."
echo "------------------------------------------------"

# Vérification des fichiers Terraform
if [ -f "terraform/frontend/main.tf" ]; then
    print_result 0 "Configuration Terraform principale présente"
else
    print_result 1 "Configuration Terraform principale manquante"
fi

if [ -f "terraform/frontend/variables.tf" ]; then
    print_result 0 "Variables Terraform présentes"
else
    print_result 1 "Variables Terraform manquantes"
fi

if [ -f "terraform/frontend/terraform.tfvars" ]; then
    print_result 0 "Valeurs des variables Terraform présentes"
else
    print_result 1 "Valeurs des variables Terraform manquantes"
fi

# Vérification de l'état Terraform
if [ -f "terraform/frontend/terraform.tfstate" ]; then
    print_result 0 "État Terraform présent (infrastructure déjà déployée)"
else
    print_warning "État Terraform absent (première exécution)"
fi

echo ""
echo "📦 Vérification de la configuration Angular..."
echo "----------------------------------------------"

# Vérification des fichiers Angular
if [ -f "package.json" ]; then
    print_result 0 "Configuration npm présente"
    
    # Vérification des scripts npm
    if grep -q '"build"' package.json; then
        print_result 0 "Script de build npm configuré"
    else
        print_result 1 "Script de build npm manquant"
    fi
else
    print_result 1 "Configuration npm manquante"
fi

if [ -f "angular.json" ]; then
    print_result 0 "Configuration Angular présente"
    
    # Vérification du nom du projet
    if grep -q "vibe-ticket-frontend" angular.json; then
        print_result 0 "Nom du projet Angular correct"
    else
        print_result 1 "Nom du projet Angular incorrect"
    fi
    
    # Vérification du dossier de sortie
    if grep -q "dist/vibe-ticket-frontend" angular.json; then
        print_result 0 "Dossier de sortie Angular correct"
    else
        print_result 1 "Dossier de sortie Angular incorrect"
    fi
else
    print_result 1 "Configuration Angular manquante"
fi

# Vérification des environnements
if [ -f "src/environments/environment.prod.ts" ]; then
    print_result 0 "Environnement de production présent"
    
    # Vérification de l'URL de l'API
    if grep -q "http://13.36.187.182:8080/api" src/environments/environment.prod.ts; then
        print_result 0 "URL de l'API backend configurée"
    else
        print_warning "URL de l'API backend à vérifier"
    fi
else
    print_result 1 "Environnement de production manquant"
fi

echo ""
echo "🔐 Vérification de la configuration Git..."
echo "------------------------------------------"

# Vérification du .gitignore
if [ -f ".gitignore" ]; then
    print_result 0 "Fichier .gitignore présent"
    
    # Vérification que terraform.tfstate n'est plus ignoré
    if grep -q "terraform.tfstate" .gitignore; then
        if grep -q "# Note: terraform.tfstate" .gitignore; then
            print_result 0 "État Terraform configuré pour être versionné"
        else
            print_warning "État Terraform encore ignoré par Git"
        fi
    else
        print_result 0 "État Terraform non ignoré par Git"
    fi
else
    print_result 1 "Fichier .gitignore manquant"
fi

echo ""
echo "🌐 Vérification de la configuration AWS..."
echo "------------------------------------------"

# Vérification de la région AWS dans terraform.tfvars
if grep -q "eu-west-3" terraform/frontend/terraform.tfvars 2>/dev/null; then
    print_result 0 "Région AWS configurée (eu-west-3)"
else
    print_warning "Région AWS à vérifier dans terraform.tfvars"
fi

# Vérification du nom du projet
if grep -q "vibe-ticket" terraform/frontend/terraform.tfvars 2>/dev/null; then
    print_result 0 "Nom du projet configuré dans Terraform"
else
    print_warning "Nom du projet à vérifier dans terraform.tfvars"
fi

echo ""
echo "📊 Résumé de la validation..."
echo "============================"
echo -e "${GREEN}✅ Succès: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Avertissements: $WARNINGS${NC}"
echo -e "${RED}❌ Erreurs: $ERRORS${NC}"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Configuration prête pour le déploiement !${NC}"
    echo ""
    echo "📋 Prochaines étapes :"
    echo "1. Configurer les secrets GitHub (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
    echo "2. Commit et push sur la branche main"
    echo "3. Surveiller l'exécution dans l'onglet Actions de GitHub"
    echo ""
    echo "📖 Consultez .github/setup-secrets.md pour la configuration des secrets"
else
    echo -e "${RED}🚨 Des erreurs doivent être corrigées avant le déploiement${NC}"
    echo ""
    echo "📖 Consultez la documentation dans .github/README.md"
fi

echo ""
echo "🔗 Liens utiles :"
echo "- Documentation GitHub Actions: .github/README.md"
echo "- Configuration des secrets: .github/setup-secrets.md"
echo "- Configuration Terraform: terraform/frontend/"
echo ""

exit $ERRORS
