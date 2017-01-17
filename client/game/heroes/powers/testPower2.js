import BasePower from './BasePower';
import BABYLON from 'babylonjs';
import {configureAutoRemove} from './powerUtils/mainUtils';

const joySymbol = Symbol('joy');

const updatePositionVec = new BABYLON.Vector3(0, 0, 0);
const update = mesh => {
    const joy = mesh.userData[joySymbol];
    if (!joy) {
        return;
    }
    updatePositionVec.x = joy.x;
    updatePositionVec.z = joy.y;
    updatePositionVec.scaleInPlace(0.25);
    mesh.position.addInPlace(updatePositionVec);
};

export default class testPower extends BasePower {
    constructor(game, hero) {
        super(game, hero);

        this.ball = null;
        //this.mask.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
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
        ball.position.y = 10;
        ball.position.z = this.hero.mask.position.z;
        var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
        ball.applyImpulse(initialVec.normalize().scale(300), ball.getAbsolutePosition());
        configureAutoRemove(ball, 6);
        ball.userData = ball.userData || {};
        ball.userData[joySymbol] = new BABYLON.Vector2(0, 0);
        ball.registerBeforeRender(update);
        this.hero.setJoyTarget(this);
    }

    buttonUp(i) {
        if (this.ball) {
            this.ball.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {mass:10, friction:0.1, restitution:0.9});
            this.ball.physicsImpostor.physicsBody.collisionFilterGroup = this.game.collisionGroupNormal;
            this.ball.physicsImpostor.physicsBody.collisionFilterMask = this.game.collisionGroupGround;
            this.ball.userData[joySymbol] = null;
            this.ball = null;
            this.hero.setJoyTarget();
        }
    }

    joyChanged(joy) {
        if (this.ball) {
            this.ball.userData[joySymbol] = joy;
        }
    }
}
