import { IdModule } from "../common/IdModule";
import {Style} from "./style.types";

export const StyleService = {
    createEmptyStyle,
}

function createEmptyStyle(name: string): Style {
 return {
     id: IdModule.generate(),
     name: name
 }
}
