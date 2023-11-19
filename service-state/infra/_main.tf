terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.63.0"
    }
  }

  backend "s3" {
    bucket         = "mika-3-prod-infra-state"
    key            = "repeater-service-state.tfstate"
    encrypt        = true
    region         = "us-east-1"
    dynamodb_table = "mika-3-prod-infra-state-locks"
  }
}

provider "aws" {
  region = "us-east-1"
}
