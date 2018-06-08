import * as React from "react"
import * as ReactDOM from "react-dom"

import { Game } from "outrun-game-core"

import { Components as  Component3d, Camera, Vector3 } from "outrun-renderer-3d"

import * as PointerLockMiddleware from "outrun-middleware-pointerlock"

import { FreeFlyingCamera } from "./FreeFlyingCamera"

// TODO: This is awkward...
const game = Game.start()

PointerLockMiddleware.activate(game)

// Input manager - +/- commands

export const MyApp = () => {
    return <div>
        <Component3d.Renderer width={800} height={600}>
            <FreeFlyingCamera initialPosition={Vector3.create(0, 10, 10)} game={game} aspectRatio={800/600}>
                <Component3d.AmbientLight color={0xFFFFFF} />
                    <Component3d.Grid />
                    <Component3d.Box position={Vector3.create(0, 0, 0)} />
            </FreeFlyingCamera>
          </Component3d.Renderer>
        </div>
}
game.setView((renderContext) => <MyApp />)

game.start()
