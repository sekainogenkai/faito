'use strict';

import BABYLON from 'babylonjs';
import {freezeHero} from './powerUtils/movementUtils';

export default class testPower {
    constructor(game, hero) {
      this.game = game;
      this.scene = game.scene;
      this.hero = hero;
      this.id = this.hero.id;
      this.speed = 300; // Initial speed

      //this.mask.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
    }
    
    usePower() {
      // Create collision mask
      this.mask = BABYLON.Mesh.CreateSphere("power", 10, 2, this.scene);
      this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:0.9});
        
      var material = new BABYLON.StandardMaterial("blue_material", this.scene);
      material.diffuseColor = BABYLON.Color3.Blue();
      this.mask.material = material;

      // Set the position and apply force
      this.mask.position.x = this.hero.mask.position.x;
      this.mask.position.z = this.hero.mask.position.z;
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      this.mask.applyImpulse(initialVec.normalize().scale(this.speed), this.mask.getAbsolutePosition());
      // Add update loop to Babylon
      this.scene.registerBeforeRender(() => {
          this.update();
      });
        
      freezeHero(this.hero);
        
      // return false if
      return true;
    }

    update () {
      //this.body.linearVelocity.scaleEqual(0.92);
    }

}
