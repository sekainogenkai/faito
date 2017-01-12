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

    // Create mesh for onGround collision check
    this.groundCheck = BABYLON.Mesh.CreateBox("mask", 4, this.scene);
    this.groundCheck.parent = this.mask;
    this.groundCheck.position.y = -2.5;
    this.groundCheck.scaling.y = 0.5;
    // Movement variables
    this.onGround = false;
    this.jumpHeight = 60;
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
    // Check for ground
    if (this.groundCheck.intersectsMesh(this.game.ground, true) && this.Input.JUMP === 0){
      this.mask.material.diffuseColor = new BABYLON.Color3.Red();
      this.onGround = true;
    }
  }

  move () {
    if (this.onGround && this.Input.JUMP != 0){
      this.mask.applyImpulse(new BABYLON.Vector3(0,this.Input.JUMP,0), this.mask.position);
      this.onGround = false;
      this.mask.material.diffuseColor = BABYLON.Color3.Blue();
    } else{
      this.mask.applyImpulse(new BABYLON.Vector3(this.speed*this.Input.AXIS_X,0,0), this.mask.position);
      this.mask.applyImpulse(new BABYLON.Vector3(0,0,this.speed*this.Input.AXIS_Y), this.mask.position);
    }
    // Limit rotation and smooth linear velocity
    //this.body.linearVelocity.scaleEqual(0.92);
    this.body.angularVelocity.scaleEqual(0);
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

  initCapsuleGeometry (radius, height, SRadius, SHeight) {
        types = [ 'sphere', 'sphere','sphere'];
        //types = [ 'sphere', 'cylinder','sphere'];
        //sizes = [ radius,radius,radius, radius,height,radius, radius,radius,radius ];
        sizes = [ radius,radius,radius, radius,radius,radius, radius,radius,radius ];
        positions = [0,0,0,   0,height*0.5,0, 0,height,0];
        var sRadius = SRadius || 20;
        var sHeight = SHeight || 10;
        var o0 = Math.PI*2;
        var o1 = Math.PI/2;
        var g = new BABYLON.Geometry();
        var m0 = new BABYLON.CylinderGeometry(radius, radius, height, sRadius, 1, true);
        var m1 = new BABYLON.SphereGeometry(radius, sRadius, sHeight, 0, o0, 0, o1);
        var m2 = new BABYLON.SphereGeometry(radius, sRadius, sHeight, 0, o0, o1, o1);
        var mtx0 = new BABYLON.Matrix4().makeTranslation(0, 0,0);
        var mtx1 = new BABYLON.Matrix4().makeTranslation(0, height*0.5,0);
        var mtx2 = new BABYLON.Matrix4().makeTranslation(0, -height*0.5,0);
        g.merge( m0, mtx0);
        g.merge( m1, mtx1);
        g.merge( m2, mtx2);
        capsuleGeometry = new BABYLON.BufferGeometry();
        capsuleGeometry.fromGeometry(g);
    }
}
