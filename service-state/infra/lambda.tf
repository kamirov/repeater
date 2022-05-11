module "lambda" {
  source = "registry.terraform.io/terraform-aws-modules/lambda/aws"

  function_name          = "service-state-${terraform.workspace}"
  description            = "Stores frontend state"

  runtime = "nodejs14.x"
  handler = "app.handler"
  timeout                = 10
  memory_size            = 256

  source_path = "${path.module}/../build"

  attach_policy_statements = true
  policy_statements = {
    s3 = {
      effect    = "Allow",
      actions   = ["s3:GetObject", "s3:PutObject"],
      resources = ["${aws_s3_bucket.state.arn}/*"]
    }
  }
}
