resource "aws_s3_bucket" "app" {
  bucket = "repeater-app-web"
}

resource "aws_s3_bucket_acl" "app" {
  bucket = aws_s3_bucket.app.id
  acl    = "public-read"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app" {
  bucket = aws_s3_bucket.app.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "app" {
  bucket = aws_s3_bucket.app.bucket
  versioning_configuration {
    status = "Enabled"
  }
}
