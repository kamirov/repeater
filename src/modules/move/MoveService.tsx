import {IdModule} from "../common/IdModule";
import {Move, MoveType} from "./move.types";

export const MoveService = {
    createEmptyMove,
    isValidMove
}

function isValidMove(move: Move) {
    // TODO: Gotta be some way to infer this from typescript
    return !(typeof move.id === 'undefined' ||
        typeof move.name === 'undefined' ||
        typeof move.styleId === 'undefined' ||
        typeof move.description === 'undefined' ||
        typeof move.link === 'undefined' ||
        typeof move.type === 'undefined' ||
        typeof move.isLearned === 'undefined');
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
