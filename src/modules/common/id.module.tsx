import {v4 as uuidv4} from 'uuid';

export const Id = {
    generate
}

function generate() {
    return uuidv4()
}