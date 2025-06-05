# =============================================================================
# CONFIGURATION TERRAFORM POUR LE FRONTEND ANGULAR
# S3 + CloudFront pour l'hébergement statique
# =============================================================================

# Configuration du provider AWS
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

# Configuration du provider AWS avec la région
provider "aws" {
  region = var.aws_region

  # Tags par défaut appliqués à toutes les ressources
  default_tags {
    tags = merge({
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Component   = "Frontend"
    }, var.custom_tags)
  }
}

# Configuration du provider Random
provider "random" {}

# =============================================================================
# DONNÉES LOCALES
# =============================================================================

locals {
  # Nom du bucket S3 (doit être unique globalement)
  bucket_name = "${var.project_name}-frontend-${var.environment}-${random_string.bucket_suffix.result}"

  # Types MIME pour les fichiers statiques
  mime_types = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"  = "font/ttf"
    ".eot"  = "application/vnd.ms-fontobject"
  }
}

# =============================================================================
# GÉNÉRATION D'UN SUFFIXE ALÉATOIRE POUR LE BUCKET
# =============================================================================

# Génère un suffixe aléatoire pour rendre le nom du bucket unique
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# =============================================================================
# BUCKET S3 POUR L'HÉBERGEMENT STATIQUE
# =============================================================================

# Création du bucket S3 principal
resource "aws_s3_bucket" "frontend_bucket" {
  bucket        = local.bucket_name
  force_destroy = true
}

# Configuration de l'hébergement web statique
resource "aws_s3_bucket_website_configuration" "frontend_bucket_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Configuration de l'accès public
resource "aws_s3_bucket_public_access_block" "frontend_bucket_pab" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}



# =============================================================================
# CLOUDFRONT ORIGIN ACCESS CONTROL (OAC)
# =============================================================================

# Création de l'Origin Access Control pour sécuriser l'accès S3
resource "aws_cloudfront_origin_access_control" "frontend_oac" {
  name                              = "${var.project_name}-frontend-oac"
  description                       = "OAC pour l'accès sécurisé au bucket S3 du frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# =============================================================================
# DISTRIBUTION CLOUDFRONT (HTTP SEULEMENT)
# =============================================================================

# Création de la distribution CloudFront
resource "aws_cloudfront_distribution" "frontend_distribution" {
  # Configuration de l'origine (bucket S3)
  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id
    origin_id                = "S3-${aws_s3_bucket.frontend_bucket.id}"
  }

  # Activation de la distribution
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Distribution CloudFront pour ${var.project_name} frontend (HTTP)"
  default_root_object = "index.html"

  # Configuration du comportement par défaut
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.id}"

    # Configuration de la politique de cache
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"  # PERMET HTTP ET HTTPS
    min_ttl                = 0
    default_ttl            = var.cloudfront_default_ttl
    max_ttl                = 86400   # 24 heures
    compress               = var.enable_compression
  }

  # Gestion des erreurs pour le routing Angular (SPA)
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Restrictions géographiques (optionnel)
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Configuration du certificat SSL (CloudFront par défaut)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # Tags spécifiques à CloudFront
  tags = {
    Name = "${var.project_name}-frontend-distribution"
  }
}

# =============================================================================
# POLITIQUE S3 POUR CLOUDFRONT
# =============================================================================

# Politique IAM pour CloudFront OAC
resource "aws_s3_bucket_policy" "frontend_bucket_cloudfront_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.frontend_bucket_pab]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend_bucket.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend_distribution.arn
          }
        }
      },
      {
        Sid       = "AllowPublicReadAccess"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      }
    ]
  })
}

# =============================================================================
# OUTPUTS
# =============================================================================

output "bucket_name" {
  description = "Nom du bucket S3"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "website_endpoint" {
  description = "URL du site web S3"
  value       = aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint
}

output "website_url" {
  description = "URL complète du site web S3"
  value       = "http://${aws_s3_bucket_website_configuration.frontend_bucket_website.website_endpoint}"
}

output "cloudfront_domain" {
  description = "Domaine CloudFront"
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
}

output "cloudfront_url_http" {
  description = "URL CloudFront en HTTP"
  value       = "http://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "ID de la distribution CloudFront"
  value       = aws_cloudfront_distribution.frontend_distribution.id
}
