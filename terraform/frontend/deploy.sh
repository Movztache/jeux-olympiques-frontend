#!/bin/bash

# =============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ POUR VIBE-TICKET FRONTEND
# Bash script pour Linux/Mac
# =============================================================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables par défaut
ACTION="deploy"
SKIP_BUILD=false
FORCE=false

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS] [ACTION]"
    echo ""
    echo "Actions:"
    echo "  deploy    Déploie l'infrastructure et upload les fichiers (défaut)"
    echo "  destroy   Supprime l'infrastructure"
    echo "  upload    Upload uniquement les fichiers (infrastructure existante)"
    echo "  plan      Affiche le plan Terraform sans l'appliquer"
    echo ""
    echo "Options:"
    echo "  --skip-build    Ignore le build Angular"
    echo "  --force         Ne demande pas de confirmation"
    echo "  --help          Affiche cette aide"
}

# Traitement des arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        deploy|destroy|upload|plan)
            ACTION=$1
            shift
            ;;
        *)
            echo -e "${RED}ERREUR: Option inconnue: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Fonctions utilitaires
log_info() {
    echo -e "${CYAN}$1${NC}"
}

log_success() {
    echo -e "${GREEN}$1${NC}"
}

log_warning() {
    echo -e "${YELLOW}$1${NC}"
}

log_error() {
    echo -e "${RED}$1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."

    # Vérifier Terraform
    if command -v terraform &> /dev/null; then
        TERRAFORM_VERSION=$(terraform version | head -n1)
        log_success "Terraform trouvé: $TERRAFORM_VERSION"
    else
        log_error "ERREUR: Terraform non trouvé. Veuillez l'installer."
        exit 1
    fi

    # Vérifier AWS CLI
    if command -v aws &> /dev/null; then
        AWS_VERSION=$(aws --version)
        log_success "AWS CLI trouvé: $AWS_VERSION"
    else
        log_error "ERREUR: AWS CLI non trouvé. Veuillez l'installer."
        exit 1
    fi

    # Vérifier Angular CLI (si build nécessaire)
    if [ "$SKIP_BUILD" = false ]; then
        if command -v ng &> /dev/null; then
            NG_VERSION=$(ng version --skip-git 2>/dev/null | grep "Angular CLI" || echo "Angular CLI")
            log_success "Angular CLI trouvé: $NG_VERSION"
        else
            log_error "ERREUR: Angular CLI non trouvé. Veuillez l'installer."
            exit 1
        fi
    fi
}

# Build Angular
build_angular() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warning "Build Angular ignoré (--skip-build)"
        return
    fi

    log_info "Build de l'application Angular..."

    # Aller au répertoire racine du projet
    PROJECT_ROOT=$(dirname $(dirname $(pwd)))
    cd "$PROJECT_ROOT"

    # Build de production
    if ng build --configuration=production; then
        log_success "Build Angular terminé avec succès"
    else
        log_error "ERREUR: Erreur lors du build Angular"
        exit 1
    fi

    # Retourner au dossier terraform
    cd "$(dirname "$0")"
}

# Déploiement de l'infrastructure
deploy_infrastructure() {
    log_info "Déploiement de l'infrastructure Terraform..."

    # Initialisation Terraform
    log_info "Initialisation Terraform..."
    if ! terraform init; then
        log_error "ERREUR: Erreur lors de l'initialisation Terraform"
        exit 1
    fi

    # Plan Terraform
    log_info "Planification Terraform..."
    if ! terraform plan -out=tfplan; then
        log_error "ERREUR: Erreur lors de la planification Terraform"
        exit 1
    fi

    # Confirmation avant apply (sauf si --force)
    if [ "$FORCE" = false ]; then
        echo -n "Voulez-vous appliquer ces changements ? (y/N): "
        read -r confirmation
        if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
            log_warning "Déploiement annulé par l'utilisateur"
            exit 0
        fi
    fi

    # Apply Terraform
    log_info "Application des changements Terraform..."
    if terraform apply tfplan; then
        log_success "Infrastructure déployée avec succès"
    else
        log_error "ERREUR: Erreur lors de l'application Terraform"
        exit 1
    fi
}

# Upload des fichiers
upload_files() {
    log_info "Upload des fichiers vers S3..."

    # Récupérer le nom du bucket depuis les outputs Terraform
    if ! BUCKET_NAME=$(terraform output -raw s3_bucket_name); then
        log_error "ERREUR: Impossible de récupérer le nom du bucket"
        exit 1
    fi

    # Vérifier que le dossier dist existe
    PROJECT_ROOT=$(dirname $(dirname $(pwd)))
    DIST_PATH="$PROJECT_ROOT/dist/vibe-ticket-frontend/browser"

    if [ ! -d "$DIST_PATH" ]; then
        log_error "ERREUR: Dossier dist non trouvé: $DIST_PATH"
        log_error "Veuillez d'abord builder l'application avec: ng build --configuration=production"
        exit 1
    fi

    # Synchroniser les fichiers
    if aws s3 sync "$DIST_PATH" "s3://$BUCKET_NAME/" --delete; then
        log_success "Fichiers uploadés vers S3 avec succès"
    else
        log_error "ERREUR: Erreur lors de l'upload vers S3"
        exit 1
    fi

    # Invalidation CloudFront
    log_info "Invalidation du cache CloudFront..."
    if DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id); then
        if aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"; then
            log_success "Cache CloudFront invalidé"
        else
            log_warning "ATTENTION: Erreur lors de l'invalidation CloudFront (non critique)"
        fi
    else
        log_warning "ATTENTION: Impossible de récupérer l'ID de distribution CloudFront"
    fi
}

# Affichage des résultats
show_results() {
    echo ""
    log_success "Déploiement terminé avec succès !"
    log_info "Informations de déploiement:"

    APP_URL=$(terraform output -raw application_url)
    BUCKET_NAME=$(terraform output -raw s3_bucket_name)
    DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

    log_success "URL de l'application: $APP_URL"
    log_info "Bucket S3: $BUCKET_NAME"
    log_info "Distribution CloudFront: $DISTRIBUTION_ID"

    echo ""
    log_info "Pour les prochaines mises à jour:"
    log_info "1. ng build --configuration=production"
    log_info "2. aws s3 sync dist/vibe-ticket-frontend/browser/ s3://$BUCKET_NAME/ --delete"
    log_info "3. aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths '/*'"
}

# Suppression de l'infrastructure
remove_infrastructure() {
    log_warning "Suppression de l'infrastructure..."

    if [ "$FORCE" = false ]; then
        echo -n "ATTENTION: Cela va supprimer définitivement toutes les ressources. Êtes-vous sûr ? (y/N): "
        read -r confirmation
        if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
            log_info "Suppression annulée"
            exit 0
        fi
    fi

    if terraform destroy -auto-approve; then
        log_success "Infrastructure supprimée avec succès"
    else
        log_error "ERREUR: Erreur lors de la suppression"
        exit 1
    fi
}

# =============================================================================
# SCRIPT PRINCIPAL
# =============================================================================

log_info "Script de déploiement Vibe-Ticket Frontend"
log_info "Action: $ACTION"

case $ACTION in
    deploy)
        check_prerequisites
        build_angular
        deploy_infrastructure
        upload_files
        show_results
        ;;
    destroy)
        check_prerequisites
        remove_infrastructure
        ;;
    upload)
        check_prerequisites
        build_angular
        upload_files
        show_results
        ;;
    plan)
        check_prerequisites
        terraform init
        terraform plan
        ;;
    *)
        log_error "ERREUR: Action non reconnue: $ACTION"
        log_info "Actions disponibles: deploy, destroy, upload, plan"
        exit 1
        ;;
esac
