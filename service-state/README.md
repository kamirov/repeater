# Repeater (backend)

This backend is used to store frontend state remotely. 
It is deployed as a set of AWS Lambdas, accessible across an AWS API Gateway.

Each folder (except those prefixed with `_`) refers to a different HTTP handler. 
Refer to the API gateway config in `_infra` for the actual API surface.


# TODO

- Add better support for testing locally. 
