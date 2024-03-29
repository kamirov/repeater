locals {
  org = "mika-3"
  env = "prod"
  app = "repeater"
  component = "app-web"
  namespace = "${local.org}-${local.app}"
  fqn = "${local.namespace}-${local.env}-${local.component}"

  default_tags = {
    App = local.app
    Component = local.component
    Environment = local.env
    Organization = local.org
  }
}