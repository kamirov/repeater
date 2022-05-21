terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket         = "repeater-infra"
    key            = "app-web/terraform.tfstate"
    encrypt        = true
    region         = "us-east-1"
    dynamodb_table = "repeater-state-locks"
  }

  required_version = ">= 1.1.5"
}

provider "aws" {
  region = "us-east-1"
}
