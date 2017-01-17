import BasePower from './BasePower';
import BABYLON from 'babylonjs';
import {secondsToTicks, configureAutoRemove} from './powerUtils/mainUtils';

const initialDirectionVec = new BABYLON.Vector3(0, 0, 1);
const matrix = new BABYLON.Matrix();
const directionSymbol = Symbol('direction');

// The animator for the ball/cursor that goes out while the user
// is holding the button.
const updateBall = mesh => {
    const direction = mesh.userData[directionSymbol];
    if (direction) {
        mesh.position.addInPlace(direction);
    }
};

const wallLifeTime = secondsToTicks(4);
const wallRemainingLifeSymbol = Symbol('wallRemainingLife');
const wallRemainingAnimationSymbol = Symbol('wallRemainingAnimation');
const wallAnimationTargetYSymbol = Symbol('wallTargetY');
const wallAnimationLength = secondsToTicks(0.25);
const wallHeight = 8;
// The animator for the wall.
const updateWall = mesh => {
    const remainingAnimation = mesh.userData[wallRemainingAnimationSymbol];
    if (remainingAnimation !== undefined) {
        if (remainingAnimation) {
            mesh.position.y = mesh.userData[wallAnimationTargetYSymbol] - wallHeight * remainingAnimation/wallAnimationLength;
            mesh.userData[wallRemainingAnimationSymbol]--;
        } else {
            mesh.userData[wallRemainingAnimationSymbol] = undefined;
            mesh.userData[wallRemainingLifeSymbol] = wallLifeTime;
            mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
        }
    }

    const remainingLife = mesh.userData[wallRemainingLifeSymbol];
    if (remainingLife !== undefined) {
        if (remainingLife) {
            mesh.userData[wallRemainingLifeSymbol]--;
        } else {
            mesh.dispose();
        }
    }
};

export default class testPower extends BasePower {
    constructor(game, hero) {
        super(game, hero);

        this.ball = null;
        //this.mask.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement

        this._directionVec = new BABYLON.Vector3(0, 0, 0);
    }

    buttonDown(i) {
        if (this.ball
            || !this.hero.consumeMana(300)) {
            return;
        }
        const ball = this.ball = BABYLON.Mesh.CreateSphere("power", 10, 2, this.game.scene);

        var material = new BABYLON.StandardMaterial("red_material", this.game.scene);
        material.diffuseColor = BABYLON.Color3.Red();
        ball.material = material;

        // Add the mask to the shadowGenerator
        this.game.shadowGenerator.getShadowMap().renderList.push(ball);
        ball.receiveShadows = true;

        // Set the position and apply force
        ball.position.x = this.hero.mask.position.x;
        ball.position.z = this.hero.mask.position.z;
        var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
        ball.applyImpulse(initialVec.normalize().scale(300), ball.getAbsolutePosition());
        configureAutoRemove(ball, 6);
        ball.userData = ball.userData || {};

        this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
        BABYLON.Vector3.TransformCoordinatesToRef(initialDirectionVec, matrix, this._directionVec);
        this._directionVec.scaleInPlace(0.5);
        ball.userData[directionSymbol] = this._directionVec;

        ball.registerBeforeRender(updateBall);
    }

    buttonUp(i) {
        if (this.ball) {
            // Place a wall.
            const wall = BABYLON.Mesh.CreateBox('wall', wallHeight, this.game.scene);
            BABYLON.Tags.EnableFor(wall);
            BABYLON.Tags.AddTagsTo(wall, "checkJump");
            wall.position.copyFrom(this.ball.position);
            wall.userData = wall.userData || {};
            wall.userData[wallAnimationTargetYSymbol] = wallHeight/2;
            wall.position.y = - wallHeight/2;
            wall.userData[wallRemainingAnimationSymbol] = wallAnimationLength;
            wall.registerAfterRender(updateWall);
            // Add the wall to the shadowGenerator
            this.game.shadowGenerator.getShadowMap().renderList.push(wall);
            wall.receiveShadows = true;

            this.ball.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:0.9});
            this.ball.userData[directionSymbol] = null;
            this.ball.dispose();
            this.ball = null;
        }
    }
}
