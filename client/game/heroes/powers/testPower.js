'use strict';

import BABYLON from 'babylonjs';

export default class testPower {
    constructor(game, player) {
      this.game = game;
      this.scene = game.scene;
      this.player = player;
      // Create collision mask
      this.mask = BABYLON.Mesh.CreateSphere("power", 10, 2, this.scene);
      this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:100, friction:0.1, restitution:1.5});
      var material = new BABYLON.StandardMaterial("red_material", this.scene);
      material.diffuseColor = BABYLON.Color3.Red();
      this.mask.material = material;

      this.mask.applyImpulse(new BABYLON.Vector3(0,10,0), this.mask.position)

      // Add update loop to Babylon
      this.scene.registerBeforeRender(() => {
          this.update();
      });
    }

    update () {
      this.body.linearVelocity.scaleEqual(0.92);
    }

}
