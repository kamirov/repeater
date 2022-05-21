#!/usr/bin/env bash

yarn --cwd get-state build
yarn --cwd put-state build

terraform -chdir=_infra apply -auto-approve
