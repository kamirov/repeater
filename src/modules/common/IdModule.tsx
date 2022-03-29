import {v4 as uuidv4} from 'uuid';

export const IdModule = {
    generate
}

function generate() {
    return uuidv4()
}
