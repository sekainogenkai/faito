'use strict';

import BABYLON from 'babylonjs';

export class Hero {
  constructor(game, id){
    this.game = game;
    this.scene = game.scene;
    this.id = id

    // Create Collision Mask
    this.mask = BABYLON.Mesh.CreateBox("mask", 5, this.scene);
    this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:1000, friction:0.001, restitution:1.5});

    // Wireframe Debug
    var material = new BABYLON.StandardMaterial("material", this.scene);
    material.wireframe = true;
    this.mask.material = material;
  }

  update() {
    this.mask.applyImpulse(new BABYLON.Vector3(0,0,1), this.mask.position);
  }
}
