import BasePower from './BasePower';
import BABYLON from 'babylonjs';
import {configureAutoRemove} from './powerUtils/mainUtils';

export default class testPower extends BasePower {
    constructor(game, hero) {
        super(game, hero);

        //this.mask.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
    }

    buttonDown(i) {
        if (!this.hero.consumeMana(300)) {
            return;
        }
        // Create collision mask
        this.mask = BABYLON.Mesh.CreateSphere("power", 10, 2, this.game.scene);
        this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:0.9});

        var material = new BABYLON.StandardMaterial("red_material", this.game.scene);
        material.diffuseColor = BABYLON.Color3.Red();
        this.mask.material = material;

        // Add the mask to the shadowGenerator
        this.game.shadowGenerator.getShadowMap().renderList.push(this.mask);
        this.mask.receiveShadows = true;

        // Set the position and apply force
        this.mask.position.x = this.hero.mask.position.x;
        this.mask.position.y = 10;
        this.mask.position.z = this.hero.mask.position.z;
        var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
        this.mask.applyImpulse(initialVec.normalize().scale(100), this.mask.getAbsolutePosition());
        configureAutoRemove(this.mask, 2);
    }
}
