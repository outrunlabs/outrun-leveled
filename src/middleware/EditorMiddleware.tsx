import * as React from "react"

import { Game, RenderEventContext, World, GameModel } from "outrun-game-core"
import { Vector3, Components } from "outrun-renderer-3d"
import { PhysicsWorld } from "outrun-physics-3d"

export type Primitive = {
    type: "box",
    position: Vector3
}

export interface EditorState {
    primitives: Primitive[]
}

export const DefaultEditorState: EditorState = {
    primitives: []
}

export type EditorActions = {
    type: "ADD_BOX",
    position: Vector3
}

export const reducer = (state: EditorState, action: EditorActions): EditorState => {
    switch (action.type) {
        case "ADD_BOX": 
            return {
                ...state,
                primitives: [...state.primitives, { type: "box", position: action.position }],
            }
    }
    return state
}

// // IDEA:
// // Can we 'wrap' the view with a provider?
// // Like, give it a 'Provider' such that types can have a consumer?

export const EditorContext = React.createContext(DefaultEditorState)

let model: GameModel<EditorState, EditorActions>

export const activate = (game: Game) => {
    
    model = game.createModel("editorState", DefaultEditorState, reducer)
}

export namespace Selectors {
    export const getPrimitives = (world: World): Primitive[] => {
        return model.selector(world).primitives || []
    }
}

// Another idea:
// connected = connectToWorld(mapStateToProps, <elem />)

export interface EditorViewProps {
    primitives: Primitive[]
}

export class EditorView extends React.Component<EditorViewProps, {}> {
    public render(): JSX.Element {

            const primitives = this.props.primitives
         if (!primitives) {
            return null
         }

            const boxes = primitives.map((b, idx) => {
                return <Components.Box key={idx.toString()} position={b.position} /> 
            })
        return <Components.Group>
            {boxes}
        </Components.Group>

    }
}
