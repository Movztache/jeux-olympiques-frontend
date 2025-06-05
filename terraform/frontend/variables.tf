# =============================================================================
# VARIABLES TERRAFORM POUR LE FRONTEND ANGULAR
# Définition de toutes les variables d'entrée
# =============================================================================

# Variable pour la région AWS
variable "aws_region" {
  description = "Région AWS où déployer les ressources"
  type        = string
  default     = "eu-west-3"

  validation {
    condition = can(regex("^[a-z]{2}-[a-z]+-[0-9]$", var.aws_region))
    error_message = "La région AWS doit être au format valide (ex: eu-west-3)."
  }
}

# Variable pour le nom du projet
variable "project_name" {
  description = "Nom du projet (utilisé pour nommer les ressources)"
  type        = string
  default     = "vibe-ticket"

  validation {
    condition = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Le nom du projet ne peut contenir que des lettres minuscules, chiffres et tirets."
  }
}

# Variable pour l'environnement
variable "environment" {
  description = "Environnement de déploiement"
  type        = string
  default     = "prod"

  validation {
    condition = contains(["dev", "staging", "prod"], var.environment)
    error_message = "L'environnement doit être dev, staging ou prod."
  }
}

# Variable pour l'URL de l'API backend
variable "backend_api_url" {
  description = "URL de l'API backend (sera utilisée dans environment.prod.ts)"
  type        = string
  default     = "http://13.36.187.182:8080/api"

  validation {
    condition = can(regex("^http://", var.backend_api_url))
    error_message = "L'URL de l'API doit commencer par http://."
  }
}

# Variable pour activer/désactiver le versioning S3
variable "enable_s3_versioning" {
  description = "Activer le versioning sur le bucket S3"
  type        = bool
  default     = true
}

# Variable pour la durée de cache par défaut CloudFront
variable "cloudfront_default_ttl" {
  description = "Durée de cache par défaut CloudFront (en secondes)"
  type        = number
  default     = 3600  # 1 heure

  validation {
    condition = var.cloudfront_default_ttl >= 0 && var.cloudfront_default_ttl <= 31536000
    error_message = "La durée de cache doit être entre 0 et 31536000 secondes (1 an)."
  }
}

# Variable pour la durée de cache des assets statiques
variable "cloudfront_assets_ttl" {
  description = "Durée de cache pour les assets statiques (en secondes)"
  type        = number
  default     = 31536000  # 1 an

  validation {
    condition = var.cloudfront_assets_ttl >= 0 && var.cloudfront_assets_ttl <= 31536000
    error_message = "La durée de cache doit être entre 0 et 31536000 secondes (1 an)."
  }
}

# Variable pour activer la compression CloudFront
variable "enable_compression" {
  description = "Activer la compression CloudFront"
  type        = bool
  default     = true
}

# Variable pour les tags personnalisés
variable "custom_tags" {
  description = "Tags personnalisés à appliquer aux ressources"
  type        = map(string)
  default     = {}
}
