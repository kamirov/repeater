import { Id } from "../common/id.module";
import {Move, MoveType} from "./move.types";

export const MoveService = {
    createEmptyMove,
}

function createEmptyMove(styleId: string, type: MoveType): Move {
 return {
     id: Id.generate(),
     name: "",
     styleId,
     description: null,
     link: null,
     type,
     isLearned: false,
 }
}
