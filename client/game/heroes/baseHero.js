'use strict';

import BABYLON from 'babylonjs';
import testPower from './powers/testPower'
import testPower2 from './powers/testPower2'

export default class Hero {
  constructor(game, id, speed=10, airSpeed=5, jumpStrength=120,
              attackPower1=testPower, attackPower2=testPower2, attackPower3=testPower, attackPower4=testPower,
             defensePower1=testPower, defensePower2=testPower, defensePower3=testPower, defensePower4=testPower){
    this.game = game;
    this.scene = game.scene;
    this.id = id

    // Create collision mask
    this.mask = this.initCapsule(4,4);
    this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.02, restitution:0.5});

    this.updateMassProperties();

    var material = new BABYLON.StandardMaterial("blue_material", this.scene);
    material.diffuseColor = BABYLON.Color3.Blue();
    this.mask.material = material;

    this.initGroundCheck();

    // Movement variables
    this.onGround = false;
    this.jumpStrength = jumpStrength;
    this.speed = speed;
    this.airSpeed = airSpeed;

    // Input
    this.Input = {
      AXIS_X : 0,
      AXIS_Y : 0,
      JUMP   : 0
    };

    // InitializeControls
    // TODO add more than just power
    this.attackPower1Pressed = false;
    this.attackPower2Pressed = false;
    this.attackPower3Pressed = false;
    this.attackPower4Pressed = false;

    // InitializePowers
    this.attackPower1 = new attackPower1(game, this);
    this.attackPower2 = new attackPower2(game, this);
    this.attackPower3 = new attackPower3(game, this);
    this.attackPower4 = new attackPower4(game, this);

    this.defensePower1 = new defensePower1(game, this);
    this.defensePower2 = new defensePower2(game, this);
    this.defensePower3 = new defensePower3(game, this);
    this.defensePower4 = new defensePower4(game, this);

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

    this.powers();
  }

  move () {
    // Movement on ground
    // get normalized vector
    var movementVector = new BABYLON.Vector3(this.speed*this.Input.AXIS_X,0,this.speed*this.Input.AXIS_Y);
    var normalizedMovementVector = movementVector.normalize();
    if (this.onGround) {
        movementVector = normalizedMovementVector.scale(this.speed);
    } else {
        movementVector = normalizedMovementVector.scale(this.airSpeed);
    }
    // movement
    //console.log(movementVector);
    this.mask.applyImpulse(movementVector, this.mask.position);
    this.mask.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.atan2(this.body.velocity.x, this.body.velocity.z), 0, 0);
    // Jump
    if (this.onGround && this.Input.JUMP) {
        this.mask.applyImpulse(new BABYLON.Vector3(0,this.Input.JUMP,0), this.mask.position);
        this.onGround = false;
        this.mask.material.diffuseColor = BABYLON.Color3.Blue();
    }
  }

  // Currently prioritizes the first power
  powers () {
    if (this.attackPower1Pressed) {
      this.useAttackPower1();
    } else if (this.attackPower2Pressed) {
      this.useAttackPower2();
    } else if (this.attackPower3Pressed) {
      this.useAttackPower3();
    } else if (this.attackPower4Pressed) {
      this.useAttackPower4();
    }
  }

  useAttackPower1 () {
      this.attackPower1Pressed = this.attackPower1.usePower();
  }

  useAttackPower2 () {
      this.attackPower2Pressed = this.attackPower2.usePower();
  }

  useAttackPower3 () {
      this.attackPower3Pressed = this.attackPower3.usePower();
  }

  useAttackPower4 () {
      this.attackPower4Pressed = this.attackPower4.usePower();
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
        this.Input.JUMP = this.jumpStrength;
        break;
      case 'u':
        this.attackPower1Pressed = true;
        break;
      case 'i':
        this.attackPower2Pressed = true;
        break;
      case 'o':
        this.attackPower3Pressed = true;
        break;
      case 'p':
        this.attackPower4Pressed = true;
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
      case 'u':
        this.attackPower1Pressed = false;
        break;
      case 'i':
        this.attackPower2Pressed = false;
        break;
      case 'o':
        this.attackPower3Pressed = false;
        break;
      case 'p':
        this.attackPower4Pressed = false;
        break;
    }
  }
}
