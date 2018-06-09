import * as React from "react"
import * as ReactDOM from "react-dom"

import { Game, GameActions, GameModel, World } from "outrun-game-core"

import { Components as  Component3d, Camera, Vector3 } from "outrun-renderer-3d"

import * as PointerLockMiddleware from "outrun-middleware-pointerlock"
// Input manager - +/- commands

export interface State {
    position: Vector3
    velocity: Vector3
    lateralVelocity: Vector3
    yaw: number
    pitch: number
}


export type FreeFlyingCameraActions = {
    type: "FORWARD_SPEED",
    speed: number
} | {
    type: "LATERAL_SPEED",
    speed: number,
}

export const reducer = (state: State, action: FreeFlyingCameraActions | GameActions | PointerLockMiddleware.OutputActions): State => {
    switch (action.type) {
        case PointerLockMiddleware.MouseMoveActionType:
            return {
                ...state,
                yaw: -action.deltaX + state.yaw,
                pitch: action.deltaY + state.pitch,
            }
        case "FORWARD_SPEED":


            const basis = Vector3.getBasisVectorsFromYawPitch(state.yaw, state.pitch)

            return {
                ...state,
                velocity: Vector3.multiplyScalar(basis.forward, action.speed)
            }
        case "LATERAL_SPEED":
            const basis2 = Vector3.getBasisVectorsFromYawPitch(state.yaw, state.pitch)
            return {
                ...state,
                lateralVelocity: Vector3.multiplyScalar(basis2.right, -action.speed)
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

export const activate = (game: Game) => {

        const model =game.createModel<State, FreeFlyingCameraActions>("free-flying-camera", {
            position: Vector3.create(0, 2, 2),
            velocity: Vector3.zero(),
            lateralVelocity: Vector3.zero(),
            yaw: 0,
            pitch: 0,
        }, reducer)

        window.addEventListener("keydown", (evt: KeyboardEvent) => {

            switch (evt.key) {
                
                case "w":
                    game.dispatch({type: "FORWARD_SPEED", speed: 10})
                    break
                case "s":
                    game.dispatch({ type: "FORWARD_SPEED", speed: -10})
                    break
                case "a":
                    game.dispatch({ type: "LATERAL_SPEED", speed: -10})
                    break
                case "d":
                    game.dispatch({ type: "LATERAL_SPEED", speed: 10})
                    break

            }
        })

        window.addEventListener("keyup", (evt: KeyboardEvent) => {
            switch (evt.key) {
                case "w":
                case "s":
                    game.dispatch({ type: "FORWARD_SPEED", speed: 0 })
                    break
                case "a":
                case "d":
                    game.dispatch({ type: "LATERAL_SPEED", speed: 0})
                    break
            }
        })
        
        const getPosition = (world: World) => {
            return model.selector(world).position
        }

    const getYaw = (world: World) => {
        return model.selector(world).yaw
    }

    const getPitch = (world: World) => {
        return model.selector(world).pitch
    }

        return {
            getPosition,
            getYaw,
            getPitch,
        }
    }

