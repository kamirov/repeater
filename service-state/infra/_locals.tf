locals {
  org = "mika-1"
  env = "prod"
  app = "repeater"
  component = "service-state"
  namespace = "${local.org}-${local.app}"
  fqn = "${local.namespace}-${local.env}-${local.component}"

  default_tags = {
    App = local.app
    Component = local.component
    Environment = local.env
    Organization = local.org
  }
}