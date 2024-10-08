import {
    Color3,
    DirectionalLight,
    Engine,
    FreeCamera,
    HemisphericLight,
    KeyboardEventTypes,
    Mesh,
    MeshBuilder,
    Scene,
    ShadowGenerator,
    StandardMaterial,
    Vector3,
} from 'babylonjs'
import { AdvancedDynamicTexture, TextBlock } from 'babylonjs-gui'
import 'babylonjs-loaders'
import { ZombieCharacter } from '../characters/zombie'
import { GraveEnvironment } from '../environments/grave'
import { isEmpty } from 'lodash'

export class GameScene {
    scene: Scene
    engine: Engine
    ground: Mesh
    zombies: ZombieCharacter[] = []
    keyboardInput: string = ''
    shadow!: ShadowGenerator
    targetZombieIndex: number | null = null

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true)
        this.scene = this.CreateScene()
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1)
        this.ground = this.CreateGround()
        this.CreateEnvironment('graveyard')
        this.CreateZombie()

        this.engine.runRenderLoop(() => {
            this.scene.render()
        })
    }

    CreateEnvironment(environment: 'graveyard') {
        switch (environment) {
            case 'graveyard':
                new GraveEnvironment(this.scene, this.shadow)
                break
        }
    }

    CreateTextBlock(text: string): TextBlock {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI')

        const textBlock = new TextBlock()
        textBlock.text = text || ''
        textBlock.color = 'red'
        textBlock.fontSize = 16
        textBlock.fontFamily = 'Inter'
        textBlock.fontWeight = 'bold'
        textBlock.linkOffsetY = '-50px'
        textBlock.isVisible = false

        advancedTexture.addControl(textBlock)

        return textBlock
    }

    CreateZombie() {
        const words = ['agree', 'notebook', 'girl', 'boy', 'car', 'cat']
        let j = 0
        for (let i = -2.5; -2.5 <= i && i <= 2.5; i = i + 1.6, j++) {
            const textBlock = this.CreateTextBlock(words[j])
            const randomNumber = Math.floor(Math.random() * 2)
            const newZombie = new ZombieCharacter(
                this.scene,
                new Vector3(i, 0, -3),
                textBlock,
                this.shadow,
                randomNumber
            )
            this.zombies.push(newZombie)
        }
    }

    CreateGround(): Mesh {
        const ground = MeshBuilder.CreateBox(
            'ground',
            {
                width: 9,
                height: 0.3,
                depth: 8,
            },
            this.scene
        )
        ground.position.y = -0.15
        ground.checkCollisions = true

        const groundMaterial = new StandardMaterial('Ground Material', this.scene)
        groundMaterial.diffuseColor = Color3.FromHexString('#556B2F')

        ground.material = groundMaterial
        ground.receiveShadows = true

        const groundBase = MeshBuilder.CreateBox(
            'groundbase',
            {
                width: 9,
                height: 4,
                depth: 8,
            },
            this.scene
        )
        groundBase.position.y = -2.3

        const groundMat = new StandardMaterial('Ground mat', this.scene)
        groundMat.diffuseColor = Color3.FromHexString('#41571B')
        groundBase.material = groundMat

        return ground
    }

    CreateCamera(): FreeCamera {
        const camera = new FreeCamera('camera', new Vector3(0, 3, 10), this.scene)
        camera.setTarget(new Vector3(0, 0, 0))

        return camera
    }

    MatchAndSlice() {
        if (this.targetZombieIndex != null) {
            const targetZombie = this.zombies[this.targetZombieIndex]
            const inputWord = this.keyboardInput

            const result = targetZombie.word.startsWith(inputWord)

            if (result) {
                targetZombie.tag.text = targetZombie.tag.text.substring(1)
                targetZombie.ChangeAnimation('hit')
                this.zombies[this.targetZombieIndex] = targetZombie
            } else {
                this.keyboardInput = this.keyboardInput.slice(0, -1)
            }

            if (result && this.keyboardInput === targetZombie.word) {
                targetZombie.ChangeAnimation('death')
                this.targetZombieIndex = null
                this.keyboardInput = ''
            }
        }
    }

    HandleZombieText(key: string) {
        this.keyboardInput += key
        const targetIndex = this.targetZombieIndex

        if (targetIndex != null) {
            this.MatchAndSlice()
        } else {
            const selectedZombieIndex = this.zombies.findIndex((zombie) => {
                const textBlock = zombie.tag as TextBlock
                return textBlock.text[0] === key
            })

            if (selectedZombieIndex != -1) {
                this.targetZombieIndex = selectedZombieIndex
                this.MatchAndSlice()
            } else {
                this.keyboardInput = ''
            }
        }
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine)
        // scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(true, 10, CANNON))
        scene.gravity = new Vector3(0, -9.81 / 60, 0)
        scene.collisionsEnabled = true

        scene.fogMode = Scene.FOGMODE_EXP
        scene.fogDensity = 0.03
        scene.fogColor = new Color3(0.2, 0.2, 0.2)

        const hemilight = new HemisphericLight('hemilight', new Vector3(0, 1, 0), this.scene)
        hemilight.intensity = 1
        hemilight.shadowEnabled = true

        var light = new DirectionalLight('dir01', new Vector3(2, -5, -2), scene)
        light.intensity = 1

        const shadowGenerator = new ShadowGenerator(1024, light)
        shadowGenerator.usePoissonSampling = true
        this.shadow = shadowGenerator

        this.CreateCamera()

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    const { keyCode, key } = kbInfo.event

                    if (keyCode === 8) {
                        this.keyboardInput = this.keyboardInput.slice(0, -1)
                        break
                    }

                    if (keyCode >= 65 && keyCode <= 90) this.HandleZombieText(key)
                    break
            }
        })

        return scene
    }
}
