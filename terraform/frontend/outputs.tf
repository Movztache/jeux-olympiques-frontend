# =============================================================================
# OUTPUTS TERRAFORM POUR LE FRONTEND ANGULAR
# Valeurs importantes retournées après le déploiement
# =============================================================================

# URL du bucket S3
output "s3_bucket_name" {
  description = "Nom du bucket S3 créé"
  value       = aws_s3_bucket.frontend_bucket.bucket
}

# URL du site web S3 (pour référence, mais on utilisera CloudFront)
output "s3_website_endpoint" {
  description = "Endpoint du site web S3"
  value       = aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint
}



# ARN du bucket S3
output "s3_bucket_arn" {
  description = "ARN du bucket S3"
  value       = aws_s3_bucket.frontend_bucket.arn
}

# Région du bucket S3
output "s3_bucket_region" {
  description = "Région du bucket S3"
  value       = aws_s3_bucket.frontend_bucket.region
}

# Informations pour le déploiement
output "deployment_info" {
  description = "Informations importantes pour le déploiement"
  value = {
    bucket_name           = aws_s3_bucket.frontend_bucket.bucket
    cloudfront_domain     = aws_cloudfront_distribution.frontend_distribution.domain_name
    cloudfront_id         = aws_cloudfront_distribution.frontend_distribution.id
    application_url       = "http://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
    backend_api_url       = var.backend_api_url
  }
}

# Commandes utiles pour le déploiement
output "deployment_commands" {
  description = "Commandes utiles pour déployer votre application"
  value = {
    build_command = "ng build --configuration=production"
    sync_command  = "aws s3 sync dist/vibe-ticket-frontend/browser/ s3://${aws_s3_bucket.frontend_bucket.bucket}/ --delete"
    invalidate_command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.frontend_distribution.id} --paths '/*'"
  }
}
