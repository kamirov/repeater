resource "aws_s3_bucket" "tf_remote_state" {
  bucket = "repeater-infra"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_remote_state" {
  bucket = aws_s3_bucket.tf_remote_state.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "tf_remote_state" {
  bucket = aws_s3_bucket.tf_remote_state.bucket
  versioning_configuration {
    status = "Enabled"
  }
}
