import * as React from "react"
import * as ReactDOM from "react-dom"

import { Game, RenderEventContext } from "outrun-game-core"
import { PhysicsWorld } from "outrun-physics-3d"

import { Components as  Component3d, Camera, Vector3, Mesh, ICamera, Vector2 } from "outrun-renderer-3d"

import * as PointerLockMiddleware from "outrun-middleware-pointerlock"
import * as FreeFlyingCameraMiddleware from "./FreeFlyingCameraMiddleware"

// TODO: This is awkward...
const game = Game.start()

PointerLockMiddleware.activate(game)

const ffm = FreeFlyingCameraMiddleware.activate(game)

const physics = new PhysicsWorld()

const basePlane = Mesh.createPlane(128, Vector2.create(-64, -64))
physics.addMesh(basePlane)

export interface PrefabMesh {
    filePath: string
    index: number
}

export interface Prefab {
    meshes: PrefabMesh[] 
}

export interface Object {
    prefab: Prefab
    position: Vector3
    scale: Vector3
    rotation: Vector3
}



// Input manager - +/- commands

export interface EditorCameraProps {

    position: Vector3
    yaw: number
    pitch: number

    aspectRatio: number

    onRayChanged?: (dir: Vector3) => void
}

export class EditorCamera extends React.Component<EditorCameraProps, {}> {
    private _camera: ICamera = null

    public componentDidMount(): void {
        window.addEventListener("mousemove", (evt: MouseEvent) => {
            console.log(`x: ${evt.clientX} y: ${evt.clientY}`)

            const x = evt.clientX
            const y = evt.clientY

            const vec = Vector3.create( 2 * (x / 800)- 1, -2 * (y/600) + 1, 1)

            if (this._camera && this.props.onRayChanged) {
                const projectedPos = this._camera.unproject(vec)
                const dir = Vector3.subtract(projectedPos, this.props.position)

                this.props.onRayChanged(dir)
            }
            
        })
    }

    public render(): JSX.Element {
        const forwardVector = Vector3.getForwardVectorFromYawPitch(this.props.yaw, this.props.pitch)
            return <Component3d.Camera position={this.props.position} lookAt={Vector3.add(this.props.position, forwardVector)} aspectRatio={this.props.aspectRatio} fov={70} near={0.1} far={500} cameraRef={(ref) => this._camera = ref }>
            {this.props.children}
        </Component3d.Camera>
        
    }
}

let testCursorDir: Vector3 = Vector3.zero()

const onRayChanged = (forwardDir: Vector3) => {
    console.dir(forwardDir)
    testCursorDir = forwardDir: Vector3
}

export const render = (rec: RenderEventContext) => {

    const yaw = ffm.getYaw(rec.nextWorld)
    const pitch = ffm.getPitch(rec.nextWorld)
    const forwardVector = Vector3.getForwardVectorFromYawPitch(yaw, pitch)

    const cameraPos = ffm.getPosition(rec.nextWorld)



    const result = physics.rayCast(cameraPos, Vector3.multiplyScalar(testCursorDir, 200))


    return <Component3d.Renderer width={800} height={600} >
            <EditorCamera position={cameraPos} yaw={yaw} pitch={pitch} aspectRatio={800/600} onRayChanged={onRayChanged}>
                <Component3d.AmbientLight color={0xFFFFFF} />
                    <Component3d.Grid />
                    <Component3d.Box position={Vector3.create(0, 0, 0)} />
                    <Component3d.Box position={Vector3.create(Math.floor(result.point.x + 0.5), Math.floor(result.point.y + 0.5), Math.floor(result.point.z + 0.5)} />
            </EditorCamera>
          </Component3d.Renderer>
}
game.setView((renderContext) => render(renderContext))

game.start()
