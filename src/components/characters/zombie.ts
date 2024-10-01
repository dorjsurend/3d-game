import {
    AbstractMesh,
    Animatable,
    Animation,
    AnimationGroup,
    KeyboardEventTypes,
    Mesh,
    Scene,
    SceneLoader,
    ShadowGenerator,
    Vector3,
} from 'babylonjs'
import { Rectangle, TextBlock } from 'babylonjs-gui'
import 'babylonjs-loaders'

export class ZombieCharacter {
    gameScene: Scene
    location: Vector3
    type: number
    word: string
    animationGroups: AnimationGroup[] = []
    public zombie!: Mesh | AbstractMesh
    tag!: TextBlock
    shadow: ShadowGenerator
    animation!: Animatable | null

    constructor(scene: Scene, location: Vector3, text: TextBlock, shadow: ShadowGenerator, type?: number) {
        this.type = type || 0
        this.location = location
        this.gameScene = scene
        this.tag = text
        this.shadow = shadow
        this.word = text.text

        this._CreateZombie().then(() => {
            this.tag.linkWithMesh(this.zombie)
            this.tag.isVisible = true
        })
    }

    private async _CreateZombie() {
        const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
            '',
            '/models/',
            'zombie.glb',
            this.gameScene
        )

        this.zombie = meshes[1] as Mesh
        this.zombie.checkCollisions = true
        this.zombie.scaling = new Vector3(0.4, 0.4, 0.4)
        this.zombie.position = this.location
        this.shadow.addShadowCaster(this.zombie)

        this.animationGroups = animationGroups

        this.CreateAnimation()
    }

    ChangeAnimation(type: 'hit' | 'death') {
        const [crawler, death, hitReaction, idle, running, walking] = this.animationGroups

        switch (type) {
            case 'hit':
                hitReaction.speedRatio = 3
                hitReaction.play()
                this.PauseAnimation()

                hitReaction.onAnimationEndObservable.add(() => {
                    this.ResumeAnimation()
                })

                break
            case 'death':
                death.play()
                this.gameScene.stopAnimation(this.zombie)

                death.onAnimationEndObservable.add(() => {
                    this.zombie.dispose()
                })

                break
        }
    }

    private CreateAnimation() {
        const [crawler, death, hitReaction, idle, running, walking] = this.animationGroups
        let maxFramesZ = 600

        switch (this.type) {
            case 0:
                running.play(true)
                maxFramesZ = 240
                break
            // crawler.play(true)
            // crawler.speedRatio = 1.5
            // maxFramesZ = 900
            // break
            // case 1:
            //     running.play(true)
            //     maxFramesZ = 240
            //     break
            default:
                walking.speedRatio *= 2.5
                walking.play(true)
        }

        const animationFramesZ = [
            {
                frame: 0,
                value: this.zombie.position.z,
            },
            {
                frame: maxFramesZ,
                value: 3.5,
            },
        ]

        const moveAnimation = new Animation(
            'zombie move',
            'position.z',
            60,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )

        moveAnimation.setKeys(animationFramesZ)

        this.zombie.animations.push(moveAnimation)
        this.animation = this.gameScene.beginAnimation(this.zombie, 0, maxFramesZ, true)
    }

    PauseAnimation() {
        if (this.animation) {
            this.animation.pause()
        }
    }

    ResumeAnimation() {
        if (this.animation) {
            this.animation.restart()
        }
    }
}
