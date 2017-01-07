'use strict';

import BABYLON from 'babylonjs';

export class Hero {
  constructor(game, id){
    this.game = game;
    this.scene = game.scene;
    this.id = id

    // Create collision mask
    this.mask = BABYLON.Mesh.CreateBox("mask", 5, this.scene);
    this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.1, restitution:1.5});
    this.drawFrame()

    this.Input = {
      AXIS_X : 0,
      AXIS_Y : 0,
      JUMP   : 0
    };
    // Calls the update loop
    var _this = this;
    this.scene.registerBeforeRender(function() {
        _this.update();
    });
  }

  update() {
    //this.mask.applyImpulse(new BABYLON.Vector3(0,0,0.1), this.mask.position);
    this.move();
  }

  move() {
    var s = 1
    this.mask.applyImpulse(new BABYLON.Vector3(s*this.Input.AXIS_X,0,0), this.mask.position);
    this.mask.applyImpulse(new BABYLON.Vector3(0,0,s*this.Input.AXIS_Y), this.mask.position);
  }

  handleKeyDownInput (e) {
    switch (e.sourceEvent.key) {
      case 'w':
        this.Input.AXIS_Y = 1;
        break;
      case 's':
        this.Input.AXIS_Y = -1;
        break;
      case 'a':
        this.Input.AXIS_X = -1;
        break;
      case 'd':
        this.Input.AXIS_X = 1;
        break;
      case 'Shift':
        this.Input.JUMP = 10;
        break;
    }
  }

  handleKeyUpInput (e) {
    switch (e.sourceEvent.key) {
      case 'w':
        this.Input.AXIS_Y = 0;
        break;
      case 's':
        this.Input.AXIS_Y = 0;
        break;
      case 'a':
        this.Input.AXIS_X = 0;
        break;
      case 'd':
        this.Input.AXIS_X = 0;
        break;
      case 'Shift':
        this.Input.JUMP = 0;
        break;
    }
  }

  drawFrame () {
    // Wireframe Debug
    var material = new BABYLON.StandardMaterial("material", this.scene);
    material.wireframe = true;
    this.mask.material = material;
  }
}
