import { AbstractMesh, Scene, SceneLoader, ShadowGenerator, Vector3 } from 'babylonjs'
import { shuffleArray } from 'src/helpers'

export class GraveEnvironment {
    scene: Scene
    shadow: ShadowGenerator

    constructor(scene: Scene, shadow: ShadowGenerator) {
        this.scene = scene
        this.shadow = shadow
        this.CreateEnvironment()
    }

    async fetchGLBS() {
        const elements = await Promise.all([
            SceneLoader.ImportMeshAsync('', '/models/', 'pinetree.glb'),
            SceneLoader.ImportMeshAsync('', '/models/', 'trunk.glb'),
            SceneLoader.ImportMeshAsync('', '/models/', 'pumpkin.glb'),
            SceneLoader.ImportMeshAsync('', '/models/', 'gravestone.glb'),
            SceneLoader.ImportMeshAsync('', '/models/', 'gravestone1.glb'),
            SceneLoader.ImportMeshAsync('', '/models/', 'roadtile.glb'),
        ])

        return elements.map(({ meshes }) => {
            const element = meshes[1]
            return element
        })
    }

    async CreateEnvironment() {
        const [tree, trunk, pumpkin, gravestone, gravestone1, roadtile] = await this.fetchGLBS()

        const sideObjects: AbstractMesh[] = [tree, trunk, pumpkin, gravestone, gravestone1]

        for (let i = 0; i < 2; i++) {
            const clonedObject = sideObjects[Math.floor(Math.random() * 4)].clone('cloned', null)
            sideObjects.push(clonedObject as AbstractMesh)
        }

        sideObjects.forEach((el) => {
            this.shadow.addShadowCaster(el)
        })
        shuffleArray(sideObjects)

        const sideLocations = [
            new Vector3(4, 0, 0),
            new Vector3(-4, 0, 0),
            new Vector3(-3.5, 0, 3),
            new Vector3(3.5, 0, 3),
            new Vector3(3.5, 0, -1),
            new Vector3(-3.5, 0, -2),
            new Vector3(3.2, 0, 2),
            new Vector3(-3.5, 0, 1),
        ]

        sideObjects.forEach((object, index) => {
            if (sideLocations.length > index) object.position = sideLocations[index]
        })

        const tileLocations = [
            new Vector3(-2.5, 0, -3.5),
            new Vector3(1, 0, -3.5),
            new Vector3(2, 0, -3.5),
            new Vector3(2, 0, 2),
            new Vector3(2, 0, 1),
            new Vector3(-2.5, 0, 0),
            new Vector3(-1.5, 0, 1),
            new Vector3(-2.5, 0, 1),
            new Vector3(0, 0, 2),
            new Vector3(1, 0, -1),
            new Vector3(-2, 0, 2.5),
        ]

        tileLocations.forEach((loc) => {
            const clonedTile = roadtile.clone('clonedtile', null) as AbstractMesh
            clonedTile.position = loc
        })
    }
}
