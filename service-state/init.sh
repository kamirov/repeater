#!/usr/bin/env bash

yarn --cwd get-state
yarn --cwd put-state

terraform -chdir=_infra init
