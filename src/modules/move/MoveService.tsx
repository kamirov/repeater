import { IdModule } from "../common/IdModule";
import {Move, MoveType} from "./move.types";

export const MoveService = {
    createEmptyMove,
}

function createEmptyMove(styleId: string, type: MoveType): Move {
 return {
     id: IdModule.generate(),
     name: "",
     styleId,
     description: null,
     link: null,
     type,
     isLearned: false,
 }
}
