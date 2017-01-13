'use strict';

import BABYLON from 'babylonjs';
import testPower from './powers/testPower'

export default class Hero {
  constructor(game, id){
    this.game = game;
    this.scene = game.scene;
    this.id = id


    // Create collision mask
    this.mask = this.initCapsule(4,4);
    this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.02, restitution:0.5});
    
    this.updateMassProperties();
      
    console.log(this.body)
    var material = new BABYLON.StandardMaterial("blue_material", this.scene);
    material.diffuseColor = BABYLON.Color3.Blue();
    this.mask.material = material;
    
    this.initGroundCheck();
    
    // Movement variables
    this.onGround = false;
    this.jumpHeight = 120;
    this.speed = 10;
    
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
    
  initCapsule (width, height) {
    // Merges three spheres to create a capsule
    var m0 = BABYLON.Mesh.CreateSphere("m0", width, height, this.scene);
    var m1 = BABYLON.MeshBuilder.CreateCylinder("m1", {height: height, diameter: width, tessellation: 20},this.scene);
    var m2 = BABYLON.Mesh.CreateSphere("m2", width, height, this.scene);
    m0.position.y -= height * 0.5;
    m2.position.y += height * 0.5;
    m0.computeWorldMatrix(true);
	  m1.computeWorldMatrix(true);
	  m2.computeWorldMatrix(true);
    return BABYLON.Mesh.MergeMeshes([m0,m1,m2], true);
  }
    
  updateMassProperties() {
    this.body.linearDamping = .2;
    this.body.fixedRotation = true;
    this.body.updateMassProperties();
  }
    
  initGroundCheck() {
    // Create mesh for onGround collision check
    this.groundCheck = BABYLON.Mesh.CreateBox("mask", 2.5, this.scene);
    this.groundCheck.parent = this.mask;
    this.groundCheck.position.y = -4;
    this.groundCheck.scaling.y = 0.2;
  }

  update () {
    // Check for ground
    if (this.groundCheck.intersectsMesh(this.game.ground, true) && this.Input.JUMP === 0){
      this.mask.material.diffuseColor = new BABYLON.Color3.Red();
      this.onGround = true;
    }
    this.move();
  }

  move () {
    // Movement on ground
    // get normalized vector
    var movementVector = new BABYLON.Vector3(this.speed*this.Input.AXIS_X,0,this.speed*this.Input.AXIS_Y);
    var normalizedMovementVector = movementVector.normalize();
    if (this.onGround) {
        movementVector = normalizedMovementVector.scale(this.speed);
    } else {
        movementVector = normalizedMovementVector.scale(this.speed / 2);
    }
    // movement
    //console.log(movementVector);
    this.mask.applyImpulse(movementVector, this.mask.position);
    
    // Jump
    if (this.onGround && this.Input.JUMP) {
        this.mask.applyImpulse(new BABYLON.Vector3(0,this.Input.JUMP,0), this.mask.position);
        this.onGround = false;
        this.mask.material.diffuseColor = BABYLON.Color3.Blue();
    }
      
    /*
    if (this.onGround && this.Input.JUMP != 0){
      this.mask.applyImpulse(new BABYLON.Vector3(0,this.Input.JUMP,0), this.mask.position);
      this.onGround = false;
      this.mask.material.diffuseColor = BABYLON.Color3.Blue();
    } else{
      this.mask.applyImpulse(new BABYLON.Vector3(this.speed*this.Input.AXIS_X,0,0), this.mask.position);
      this.mask.applyImpulse(new BABYLON.Vector3(0,0,this.speed*this.Input.AXIS_Y), this.mask.position);
    }*/
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
}
