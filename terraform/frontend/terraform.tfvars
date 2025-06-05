# =============================================================================
# CONFIGURATION TERRAFORM POUR LE FRONTEND ANGULAR
# Valeurs des variables pour le déploiement
# =============================================================================

# Configuration AWS
aws_region   = "eu-west-3"
project_name = "vibe-ticket"
environment  = "prod"

# URL de votre API backend (à modifier selon votre déploiement backend)
# Cette URL sera utilisée dans environment.prod.ts
backend_api_url = "http://13.36.187.182:8080/api"

# Configuration S3
enable_s3_versioning = true

# Configuration CloudFront
cloudfront_default_ttl = 3600      # 1 heure pour les pages HTML
cloudfront_assets_ttl  = 31536000  # 1 an pour les assets statiques
enable_compression     = true

# Tags personnalisés (optionnel)
custom_tags = {
  Owner       = "DevTeam"
  CostCenter  = "IT"
  Application = "VibeTicket"
}
