'use strict';

import BABYLON from 'babylonjs';
import testPower from './powers/testPower'

export default class Hero {
  constructor(game, id){
    this.game = game;
    this.scene = game.scene;
    this.id = id


    // Create collision mask
    this.mask = BABYLON.Mesh.CreateBox("mask", 5, this.scene);
    this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.5, restitution:0.5});
    var material = new BABYLON.StandardMaterial("blue_material", this.scene);
    material.diffuseColor = BABYLON.Color3.Blue();
    this.mask.material = material;

    // Movement variables
    this.mask.onGround = false;
    this.jumpHeight = 100;
    this.speed = 2;
    // Input
    this.Input = {
      AXIS_X : 0,
      AXIS_Y : 0,
      JUMP   : 0
    };
    // Add update loop to Babylon
    this.scene.registerBeforeRender(() => {
        this.update();
    });
  }

  update () {
    this.move();
  }

  move () {
    if (this.mask.onGround && this.Input.JUMP != 0){
      this.mask.applyImpulse(new BABYLON.Vector3(0,this.Input.JUMP,0), this.mask.position);
      this.mask.onGround = false;
      this.mask.material.diffuseColor = BABYLON.Color3.Blue();
    } else{
      this.mask.applyImpulse(new BABYLON.Vector3(this.speed*this.Input.AXIS_X,0,0), this.mask.position);
      this.mask.applyImpulse(new BABYLON.Vector3(0,0,this.speed*this.Input.AXIS_Y), this.mask.position);
    }
    // Limit rotation and smooth linear velocity
    //this.body.linearVelocity.scaleEqual(0.92);
    //this.body.angularVelocity.scaleEqual(0);
  }

  usePower () {
    var power = new testPower(this.game, this)
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
        this.Input.JUMP = this.jumpHeight;
        break;
      case 'Enter':
        this.usePower();
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
