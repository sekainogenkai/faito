import basePower from './powers/basePower';
import BABYLON from 'babylonjs';
import {configureAutoRemove} from './powerUtils/mainUtils';

export default class testPower extends basePower {
    constructor(game, hero) {
        super(game, hero);

        //this.ball.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
    }

    buttonDown(i) {
        if (!this.hero.consumeMana(300)) {
            return;
        }
        // Create collision ball
        this.ball = BABYLON.Mesh.CreateSphere("power", 10, 2, this.game.scene);
        this.ball.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:0.9});
        this.ball.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupNormal;
        this.ball.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
        var material = new BABYLON.StandardMaterial("red_material", this.game.scene);
        material.diffuseColor = BABYLON.Color3.Red();
        this.ball.material = material;

        // Add the ball to the shadowGenerator
        this.game.scene.shadowGenerator.getShadowMap().renderList.push(this.ball);
        this.ball.receiveShadows = true;

        // Set the position and apply force
        this.ball.position.x = this.hero.mask.position.x;
        this.ball.position.y = 10;
        this.ball.position.z = this.hero.mask.position.z;
        var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
        this.ball.applyImpulse(initialVec.normalize().scale(100), this.ball.getAbsolutePosition());
        configureAutoRemove(this.ball, 2);
    }
}
