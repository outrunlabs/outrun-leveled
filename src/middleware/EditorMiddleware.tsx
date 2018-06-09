import * as React from "react"

import { Game, RenderEventContext, World, GameModel, connectToWorld } from "outrun-game-core"
import { Vector3, Components, Mesh } from "outrun-renderer-3d"
import { PhysicsWorld } from "outrun-physics-3d"

export type Primitive = {
  type: "box"
  position: Vector3
}


export interface PrefabInfo {
    meshFiles: string[]
    position: Vector3
}

export interface EditorState {
  primitives: Primitive[] 
  prefabs: PrefabInfo[]
}

export const DefaultEditorState: EditorState = {
  primitives: [],
  prefabs: [],
}

export type EditorActions = {
  type: "ADD_BOX"
  position: Vector3
} | {
    type: "ADD_PREFAB",
    position: Vector3
}

export const reducer = (
  state: EditorState,
  action: EditorActions
): EditorState => {
  switch (action.type) {
    case "ADD_BOX":
      return {
        ...state,
        primitives: [
          ...state.primitives,
          { type: "box", position: action.position },
        ],
      }
    case "ADD_PREFAB":
          return {
            ...state,
              prefabs: [
                ...state.prefabs,
                { meshFiles: ["E:/outrun/outrun-test-level/meshes/barrel01.obj"], position: action.position}
              ]
          }
  }
  return state
}

// // IDEA:
// // Can we 'wrap' the view with a provider?
// // Like, give it a 'Provider' such that types can have a consumer?

export const EditorContext = React.createContext(DefaultEditorState)

export const activate = (game: Game) => {
  const model = game.createModel("editorState", DefaultEditorState, reducer)
}

// bindSelectors(selectors, modelName)
// Let's us always access them from the world, with less awkwardness

export namespace Selectors {
  export const getEditorState = (world: World): EditorState => {
    return World.getModelState<EditorState>(world, "editorState") || DefaultEditorState
  }
}

// Another idea:
// connected = connectToWorld(mapWorldToProps, <elem />)
// connected = connectToModel("model", mapModelToProps, <elem />)
// Store model as name

export interface EditorViewProps extends EditorState {
  primitives: Primitive[]
}

export class EditorView extends React.PureComponent<EditorViewProps, {}> {
  public render(): JSX.Element {
      const { prefabs, primitives } = this.props
    if (!primitives) {
      return null
    }

    const boxes = primitives.map((b, idx) => {
      return <Components.Box key={idx.toString()} position={b.position} />
    })

    const prefabView = prefabs.map((prefab, idx) => {
        return <Components.Transform transform={[{translate: prefab.position}]}>
            <Components.Material material={{type: "normal"}}>
            <Components.Mesh mesh={Mesh.fromFile(prefab.meshFiles[0]).then(mesh => mesh[0])} />
            </Components.Material>
            </Components.Transform>
    })
    return <Components.Group>{boxes}{prefabView}</Components.Group>
  }
}

export const ConnectedEditor = connectToWorld(world => Selectors.getEditorState(world))(EditorView)

