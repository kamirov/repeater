terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.36.1"
    }
  }

  backend "s3" {
    bucket         = "mika-1-prod-infra-state"
    key            = "repeater-app-web.tfstate"
    encrypt        = true
    region         = "us-east-1"
    dynamodb_table = "mika-1-prod-infra-state-locks"
  }
}

provider "aws" {
  region = "us-east-1"
}
