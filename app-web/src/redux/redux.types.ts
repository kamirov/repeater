import reducer from "./reducer";

export type Action = {
    type: string
    payload: any
}

export type RootState = ReturnType<typeof reducer>
