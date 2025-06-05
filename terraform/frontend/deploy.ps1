# =============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ POUR VIBE-TICKET FRONTEND
# PowerShell script pour Windows
# =============================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "deploy",

    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,

    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

# Couleurs pour l'affichage
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "Vérification des prérequis..." $InfoColor

    # Vérifier Terraform
    try {
        $terraformVersion = terraform version
        Write-ColorOutput "Terraform trouvé: $($terraformVersion[0])" $SuccessColor
    } catch {
        Write-ColorOutput "ERREUR: Terraform non trouvé. Veuillez l'installer." $ErrorColor
        exit 1
    }

    # Vérifier AWS CLI
    try {
        $awsVersion = aws --version
        Write-ColorOutput "AWS CLI trouvé: $awsVersion" $SuccessColor
    } catch {
        Write-ColorOutput "ERREUR: AWS CLI non trouvé. Veuillez l'installer." $ErrorColor
        exit 1
    }

    # Vérifier Angular CLI
    if (-not $SkipBuild) {
        try {
            $ngVersion = ng version --skip-git 2>$null | Select-String "Angular CLI"
            Write-ColorOutput "Angular CLI trouvé: $ngVersion" $SuccessColor
        } catch {
            Write-ColorOutput "ERREUR: Angular CLI non trouvé. Veuillez l'installer." $ErrorColor
            exit 1
        }
    }
}

function Build-Angular {
    if ($SkipBuild) {
        Write-ColorOutput "Build Angular ignoré (--SkipBuild)" $WarningColor
        return
    }

    Write-ColorOutput "Build de l'application Angular..." $InfoColor

    # Aller au répertoire racine du projet
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    Set-Location $projectRoot

    # Build de production
    $buildResult = ng build --configuration=production
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Erreur lors du build Angular" $ErrorColor
        exit 1
    }

    Write-ColorOutput "Build Angular terminé avec succès" $SuccessColor

    # Retourner au dossier terraform
    Set-Location "$PSScriptRoot"
}

function Deploy-Infrastructure {
    Write-ColorOutput "Déploiement de l'infrastructure Terraform..." $InfoColor

    # Initialisation Terraform
    Write-ColorOutput "Initialisation Terraform..." $InfoColor
    terraform init
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Erreur lors de l'initialisation Terraform" $ErrorColor
        exit 1
    }

    # Plan Terraform
    Write-ColorOutput "Planification Terraform..." $InfoColor
    terraform plan -out=tfplan
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Erreur lors de la planification Terraform" $ErrorColor
        exit 1
    }

    # Confirmation avant apply (sauf si --Force)
    if (-not $Force) {
        $confirmation = Read-Host "Voulez-vous appliquer ces changements ? (y/N)"
        if ($confirmation -ne "y" -and $confirmation -ne "Y") {
            Write-ColorOutput "Déploiement annulé par l'utilisateur" $WarningColor
            exit 0
        }
    }

    # Apply Terraform
    Write-ColorOutput "Application des changements Terraform..." $InfoColor
    terraform apply tfplan
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Erreur lors de l'application Terraform" $ErrorColor
        exit 1
    }

    Write-ColorOutput "Infrastructure déployée avec succès" $SuccessColor
}

function Upload-Files {
    Write-ColorOutput "Upload des fichiers vers S3..." $InfoColor

    # Récupérer le nom du bucket depuis les outputs Terraform
    $bucketName = terraform output -raw s3_bucket_name
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Impossible de récupérer le nom du bucket" $ErrorColor
        exit 1
    }

    # Synchroniser les fichiers
    $projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
    $distPath = "$projectRoot/dist/vibe-ticket-frontend/browser"

    if (-not (Test-Path $distPath)) {
        Write-ColorOutput "ERREUR: Dossier dist non trouvé: $distPath" $ErrorColor
        Write-ColorOutput "Veuillez d'abord builder l'application avec: ng build --configuration=production" $ErrorColor
        exit 1
    }

    aws s3 sync $distPath s3://$bucketName/ --delete
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Erreur lors de l'upload vers S3" $ErrorColor
        exit 1
    }

    Write-ColorOutput "Fichiers uploadés vers S3 avec succès" $SuccessColor

    # Invalidation CloudFront
    Write-ColorOutput "Invalidation du cache CloudFront..." $InfoColor
    $distributionId = terraform output -raw cloudfront_distribution_id
    aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*"
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ATTENTION: Erreur lors de l'invalidation CloudFront (non critique)" $WarningColor
    } else {
        Write-ColorOutput "Cache CloudFront invalidé" $SuccessColor
    }
}

function Show-Results {
    Write-ColorOutput "`nDéploiement terminé avec succès !" $SuccessColor
    Write-ColorOutput "Informations de déploiement:" $InfoColor

    $appUrl = terraform output -raw application_url
    $bucketName = terraform output -raw s3_bucket_name
    $distributionId = terraform output -raw cloudfront_distribution_id

    Write-ColorOutput "URL de l'application: $appUrl" $SuccessColor
    Write-ColorOutput "Bucket S3: $bucketName" $InfoColor
    Write-ColorOutput "Distribution CloudFront: $distributionId" $InfoColor

    Write-ColorOutput "`nPour les prochaines mises à jour:" $InfoColor
    Write-ColorOutput "1. ng build --configuration=production" $InfoColor
    Write-ColorOutput "2. aws s3 sync dist/vibe-ticket-frontend/browser/ s3://$bucketName/ --delete" $InfoColor
    Write-ColorOutput "3. aws cloudfront create-invalidation --distribution-id $distributionId --paths '/*'" $InfoColor
}

function Remove-Infrastructure {
    Write-ColorOutput "Suppression de l'infrastructure..." $WarningColor

    if (-not $Force) {
        $confirmation = Read-Host "ATTENTION: Cela va supprimer définitivement toutes les ressources. Êtes-vous sûr ? (y/N)"
        if ($confirmation -ne "y" -and $confirmation -ne "Y") {
            Write-ColorOutput "Suppression annulée" $InfoColor
            exit 0
        }
    }

    terraform destroy -auto-approve
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "ERREUR: Erreur lors de la suppression" $ErrorColor
        exit 1
    }

    Write-ColorOutput "Infrastructure supprimée avec succès" $SuccessColor
}

# =============================================================================
# SCRIPT PRINCIPAL
# =============================================================================

Write-ColorOutput "Script de déploiement Vibe-Ticket Frontend" $InfoColor
Write-ColorOutput "Action: $Action" $InfoColor

switch ($Action.ToLower()) {
    "deploy" {
        Test-Prerequisites
        Build-Angular
        Deploy-Infrastructure
        Upload-Files
        Show-Results
    }
    "destroy" {
        Test-Prerequisites
        Remove-Infrastructure
    }
    "upload" {
        Test-Prerequisites
        Build-Angular
        Upload-Files
        Show-Results
    }
    "plan" {
        Test-Prerequisites
        terraform init
        terraform plan
    }
    default {
        Write-ColorOutput "ERREUR: Action non reconnue: $Action" $ErrorColor
        Write-ColorOutput "Actions disponibles: deploy, destroy, upload, plan" $InfoColor
        exit 1
    }
}
