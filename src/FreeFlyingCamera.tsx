import * as React from "react"
import * as ReactDOM from "react-dom"

import { Game, GameActions, GameModel, World } from "outrun-game-core"

import { Components as  Component3d, Camera, Vector3 } from "outrun-renderer-3d"

// Input manager - +/- commands

export interface FreeFlyingCameraProps {
    initialPosition: Vector3
    aspectRatio: number
    game: Game
}


export interface State {
    position: Vector3
    velocity: Vector3
    lateralVelocity: Vector3
}

export type FreeFlyingCameraActions = {
    type: "FORWARD_SPEED",
    speed: number
} | {
    type: "LATERAL_SPEED",
    speed: number,
}

export const reducer = (state: State, action: FreeFlyingCameraActions | GameActions ): State => {
    switch (action.type) {
        case "FORWARD_SPEED":
            return {
                ...state,
                velocity: Vector3.multiplyScalar(Vector3.forward(), action.speed)
            }
        case "LATERAL_SPEED":
            return {
                ...state,
                lateralVelocity: Vector3.multiplyScalar(Vector3.right(), action.speed)
            }

        case "@@core/TICK":
            const forwardStep = Vector3.multiplyScalar(state.velocity, action.deltaTime)
            const lateralStep = Vector3.multiplyScalar(state.lateralVelocity, action.deltaTime)
            const totalStep = Vector3.add(forwardStep, lateralStep)

            return {
                ...state,
                position: Vector3.add(state.position, totalStep),
            }
        default:
            return state
        
    }
}

export interface FreeFlyingCameraState {
    model: GameModel<State, FreeFlyingCameraActions>
}


export class FreeFlyingCamera extends React.PureComponent<FreeFlyingCameraProps, FreeFlyingCameraState> {

    constructor(props: FreeFlyingCameraProps) {
        super(props)

        this.state = {
            model: null,
        }
    }

    public componentDidMount(): void {

        const model =this.props.game.createModel<State, FreeFlyingCameraActions>("free-flying-camera", {
            position: this.props.initialPosition,
            velocity: Vector3.zero(),
            lateralVelocity: Vector3.zero(),
        }, reducer)

        window.addEventListener("keydown", (evt: KeyboardEvent) => {

            switch (evt.key) {
                
                case "w":
                    this.props.game.dispatch({type: "FORWARD_SPEED", speed: 10})
                    break
                case "s":
                    this.props.game.dispatch({ type: "FORWARD_SPEED", speed: -10})
                    break
                case "a":
                    this.props.game.dispatch({ type: "LATERAL_SPEED", speed: -10})
                    break
                case "d":
                    this.props.game.dispatch({ type: "LATERAL_SPEED", speed: 10})
                    break

            }
        })

        window.addEventListener("keyup", (evt: KeyboardEvent) => {

            switch (evt.key) {
                case "w":
                case "s":
                    this.props.game.dispatch({ type: "FORWARD_SPEED", speed: 0 })
                    break
                case "a":
                case "d":
                    this.props.game.dispatch({ type: "LATERAL_SPEED", speed: 0})
                    break
            }
        })
        
        this.setState({ model })
    }

    public render(): JSX.Element {
        if (!this.state.model) {
            return null
        }

        const world = this.props.game.getWorld()
        const position = this.state.model.selector(world).position

        return <Camera position={position} lookAt={Vector3.zero()} fov={70} aspectRatio={this.props.aspectRatio} near={0.1} far={500}>
                    {this.props.children}
                </Camera>
        
    }
    
}

