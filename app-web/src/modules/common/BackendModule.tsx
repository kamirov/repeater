import axios from 'axios'
import {Environment} from "./EnvironmentModule";
import {StorageModule} from "./StorageModule";

export const BackendModule = {
    post,
    put,
    patch,
    get,

    getApiSecret
}

const apiSecretKey = 'api-secret'

const apiRoot = Environment.apiRoot
let apiSecret: string

function init() {
    apiSecret = getApiSecret()
    StorageModule.set(apiSecretKey, apiSecret)
}

function getApiSecret() {
    return StorageModule.get(apiSecretKey) || ""
}

async function post(path: string, params?: any) {
    return axios.post(apiRoot + path, params, {
        headers: getCommonHeaders()
    }).catch(catchError)
}

async function put(path: string, params?: any) {
    return axios.put(apiRoot + path, params, {
        headers: getCommonHeaders()
    }).catch(catchError)
}

async function patch(path: string, params?: any) {
    return axios.patch(apiRoot + path, params, {
        headers: getCommonHeaders()
    }).catch(catchError)
}

async function get(path: string, params?: any) {
    const config = {
        params,
        headers: getCommonHeaders()
    }

    return axios.get(apiRoot + path, config)
        .then(response => response.data)
        .catch(catchError)
}

function getCommonHeaders() {
    const headers: HttpHeaders = {}
    if (apiSecret) {
        headers.Authorization = `Bearer ${apiSecret}`
    }

    return headers
}

function catchError(error: any) {
    console.log('error')
    console.log(error)
    if (error.message) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        throw error.response.data.message
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        throw error.request
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        throw error.message
    }
    // console.log(error.config);
}

type HttpHeaders = {
    [headerName: string]: string
}

init()
