import { IdModule } from "../common/IdModule";
import {Style} from "./style.types";

export const StyleService = {
    createEmptyStyle,
    isValidStyle
}

function isValidStyle(style: Style) {

    // TODO: Gotta be some way to infer this from typescript
    return !(typeof style.id === 'undefined' ||
        typeof style.name === 'undefined');
}

function createEmptyStyle(name: string): Style {
 return {
     id: IdModule.generate(),
     name: name
 }
}
