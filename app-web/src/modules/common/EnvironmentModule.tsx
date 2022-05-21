export const Environment = {
    apiRoot: process.env.REACT_APP_API_ROOT as string,
}

function init() {
    validate()
}

function validate() {
    [
        'REACT_APP_API_ROOT',
    ].forEach(key => {
        if (!process.env[key]) {
            throw new Error(`${key} not set on the environment`)
        }
    })
}

init()
