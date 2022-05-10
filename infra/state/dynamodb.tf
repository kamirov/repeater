resource "aws_dynamodb_table" "tf_state_locks" {
  hash_key = "LockID"
  name     = "repeater-state-locks"
  attribute {
    name = "LockID"
    type = "S"
  }
  billing_mode = "PAY_PER_REQUEST"
}
