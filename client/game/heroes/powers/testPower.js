'use strict';

import BABYLON from 'babylonjs';

export default class testPower {
    constructor(game, hero) {
      this.game = game;
      this.scene = game.scene;
      this.hero = hero;

      this.speed = 100; // Initial speed
      // Create collision mask
      this.mask = BABYLON.Mesh.CreateSphere("power", 10, 2, this.scene);
      this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:0.9});
      var material = new BABYLON.StandardMaterial("red_material", this.scene);
      material.diffuseColor = BABYLON.Color3.Red();
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
    }

    update () {
      //this.body.linearVelocity.scaleEqual(0.92);
    }

}
