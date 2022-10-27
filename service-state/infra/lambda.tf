module "lambda_get_state" {
  source = "registry.terraform.io/terraform-aws-modules/lambda/aws"

  function_name = "${local.fqn}-get-state"
  description   = "Gets frontend state"

  publish = true
  runtime     = "nodejs16.x"
  handler     = "app.handler"
  timeout     = 10
  memory_size = 256

  source_path = "${path.module}/../get-state/build"

  attach_policy_statements = true
  policy_statements = {
    s3 = {
      effect    = "Allow",
      actions   = ["s3:GetObject"],
      resources = ["${aws_s3_bucket.state.arn}/*"]
    }
  }

  allowed_triggers = {
    AllowExecutionFromAPIGateway = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.apigatewayv2_api_execution_arn}/*/*"
    }
  }

  tags = local.default_tags
}


module "lambda_put_state" {
  source = "registry.terraform.io/terraform-aws-modules/lambda/aws"

  function_name = "${local.fqn}-put-state-${terraform.workspace}"
  description   = "Stores frontend state"

  publish = true
  runtime     = "nodejs16.x"
  handler     = "app.handler"
  timeout     = 10
  memory_size = 256

  source_path = "${path.module}/../put-state/build"

  attach_policy_statements = true
  policy_statements = {
    s3 = {
      effect    = "Allow",
      actions   = ["s3:PutObject"],
      resources = ["${aws_s3_bucket.state.arn}/*"]
    }
  }

  allowed_triggers = {
    AllowExecutionFromAPIGateway = {
      service    = "apigateway"
      source_arn = "${module.api_gateway.apigatewayv2_api_execution_arn}/*/*"
    }
  }

  tags = local.default_tags
}
