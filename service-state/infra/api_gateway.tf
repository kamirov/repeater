module "api_gateway" {
  source = "registry.terraform.io/terraform-aws-modules/apigateway-v2/aws"

  name          = "service-state-${terraform.workspace}"
  protocol_type = "HTTP"

  cors_configuration = {
    allow_headers = ["content-type", "x-amz-date", "authorization", "x-api-key", "x-amz-security-token", "x-amz-user-agent"]
    allow_methods = ["*"]
    allow_origins = ["*"]
  }

  create_api_domain_name = false

  # Access logs
  default_stage_access_log_format          = "$context.identity.sourceIp - - [$context.requestTime] \"$context.httpMethod $context.routeKey $context.protocol\" $context.status $context.responseLength $context.requestId $context.integrationErrorMessage"

  # Routes and integrations
  integrations = {
    "$default" = {
      lambda_arn = module.lambda.lambda_function_arn
    }
  }
}
