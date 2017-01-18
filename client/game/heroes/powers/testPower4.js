import BasePower from './BasePower';
import BABYLON from 'babylonjs';
import {secondsToTicks, configureAutoRemove} from './powerUtils/mainUtils';


const rampRemainingAnimationSymbol = Symbol('rampRemainingAnimation');
const rampAnimationTargetYSymbol = Symbol('rampTargetY');
const rampGameReferenceSymbol = Symbol('rampGameReference');
const rampAnimationLength = secondsToTicks(0.25);
const rampHeight = 8;
// The animator for the ramp.
const updateRamp = mesh => {
    const remainingAnimation = mesh.userData[rampRemainingAnimationSymbol];
    if (remainingAnimation !== undefined) {
        if (remainingAnimation) {
            mesh.position.y = mesh.userData[rampAnimationTargetYSymbol] - rampHeight * remainingAnimation/rampAnimationLength;
            mesh.userData[rampRemainingAnimationSymbol]--;
        } else {
            mesh.userData[rampRemainingAnimationSymbol] = undefined;
            mesh.physicsImpostor.physicsBody.collisionFilterMask = mesh.userData[rampGameReferenceSymbol].collisionGroupGround | mesh.userData[rampGameReferenceSymbol].collisionGroupNormal;
        }
    }
};

export default class testPower extends BasePower {
    constructor(game, hero) {
        super(game, hero);

        //this.mesh.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
    }

    buttonDown(i) {
        if (!this.hero.consumeMana(300)) {
            return;
        }
        // Place a this.mesh.
        this.mesh = BABYLON.Mesh.CreateBox('this.mesh', rampHeight, this.game.scene);
        BABYLON.Tags.EnableFor(this.mesh);
        BABYLON.Tags.AddTagsTo(this.mesh, "checkJump");
        this.mesh.rotation.x += 4;
        this.mesh.position = new BABYLON.Vector3.Zero();
        this.mesh.userData = this.mesh.userData || {};
        this.mesh.userData[rampAnimationTargetYSymbol] = rampHeight/3;
        this.mesh.position.y = -rampHeight/3;
        this.mesh.userData[rampRemainingAnimationSymbol] = rampAnimationLength;
        this.mesh.userData[rampGameReferenceSymbol] = this.game;
        this.mesh.registerAfterRender(updateRamp);
        this.mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
        this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.collisionGroupGround;
        this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.collisionGroupNormal;
        // Add the this.mesh to the shadowGenerator
        this.game.shadowGenerator.getShadowMap().renderList.push(this.mesh);
        this.mesh.receiveShadows = true;
        configureAutoRemove(this.mesh, 5);
    }
}
