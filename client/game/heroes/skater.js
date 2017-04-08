import BABYLON from 'babylonjs';

import BaseHero from './baseHero';


import SkaterPowerHandler from './powers/heroPowers/skater/aHandler';


const upAxis = new CANNON.Vec3(0, 1, 0);
const onGroundPadding = 10;
const rotationMultiplier = 2.5;

export default class Skater extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:9, jumpStrength:170, rollGroundSpeed:18, rollAirSpeed:10},
    SkaterPowerHandler);
    this.skateGroundLinearDampening = .5;
    this.skateAirLinearDampening = .3;
  }

  // change animation for if the skater is a skating
  animations() {
    if (this.body.fixedRotation) {
      super.animations();
    } else {
      this.startAnimationNew(this.idleAnimation);
      this.currentAnimatable.speedRatio = .5;
    }
  }

  update() {
    //console.log(this.body.velcoti);
    super.update();
    this.airRotation();
    this.setAirLinearVelocity();
  }

  setAirLinearVelocity() {
     if (!this.onGround && this.powerHandler.powerSkateBoard.object) {
       this.body.linearDamping = this.skateAirLinearDampening;
       this.body.updateMassProperties();
    }
  }

  checkGround() {
    let skaterObject = this.powerHandler.powerSkateBoard.object;
    if (this.body.fixedRotation) {
      super.checkGround();
    } else if (skaterObject) {
      // check if hero hits the ground. Destroy the board if he does.
      if (this.onGround > 0) {
        this.onGround -= 1;
      }
      this.mask.physicsImpostor.physicsBody.world.contacts.forEach(function(contact) {
        //http://schteppe.github.io/cannon.js/examples/threejs_voxel_fps.html
        var collision = false;
        if (contact.bi.id == skaterObject.mesh.physicsImpostor.physicsBody.id) {
          contact.ni.negate(this.contactNormal);
          collision = true;
        } else if (contact.bj.id == skaterObject.mesh.physicsImpostor.physicsBody.id){
          this.contactNormal.copy(contact.ni);
          collision = true;
        }
        if(collision && this.contactNormal.dot(upAxis) > 0.4){ // 0.5 is the threshold
          this.onGround = onGroundPadding;
          // Should we break the board?
          const boardRotationMatrix = new BABYLON.Matrix();
          this.mask.rotationQuaternion.toRotationMatrix(boardRotationMatrix);
          const boardUpVector = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 1, 0), boardRotationMatrix);
          const contactNormalVector = BABYLON.Vector3.FromArray(this.contactNormal.toArray());
          const projection = BABYLON.Vector3.Dot(contactNormalVector, boardUpVector);
          // allow 45 degrees tollerance, number is: sin(90-45)
          if (projection < .7) {
            //this.powerHandler.powerSkateBoard.object.dropRange = 100;
            //this.powerHandler.powerSkateBoard.object.lifeSpan -= this.powerHandler.powerSkateBoard.object.lifeSpan;
            this.onGround = 0;
            this.body.linearDamping = .99;
            this.body.updateMassProperties();
          } else {
            // First, calculate the current distance between the current rotation
            // and the next. http://math.stackexchange.com/a/167828
            //const contactNormalDeviationFromUp = contactNormalVector.toQuaternion().multiply(new BABYLON.Vector3(0, 1, 0).toQuaternion().conjugateInPlace());
            //const theta = 2 * Math.acos(skaterObject.mesh.rotationQuaternion.multiply(contactNormalDeviationFromUp.conjugateInPlace()).x);
            // console.log('copying rotation matrix');

            this.body.angularVelocity.set(1,1,0);
            this.mask.rotationQuaternion =
            new BABYLON.Quaternion.RotationYawPitchRoll(
                                                           Math.atan2(contactNormalVector.x, contactNormalVector.z),
                                                           Math.asin(-contactNormalVector.y) + Math.PI/2,
                                                          0);
            this.powerHandler.boardPush(-.8);

            // make the character slower on the ground
            this.body.linearDamping = this.skateGroundLinearDampening;
            this.body.updateMassProperties();
            // rotate board to direction
            //this.powerHandler.powerSkateBoard.object.mesh.


          }
        }
      }, this);
    }
  }

  setRotation (superRotation=false) {
    if (this.body.fixedRotation || superRotation) {
      // console.log('fixed rotation', this.body.fixedRotation);
      super.setRotation();
    }
  }

  airRotation () {
    if (this.body.fixedRotation || this.onGround) {
      return;
    }

    this.body.angularVelocity.set(this.Input.AXIS_Y* rotationMultiplier, 0, -this.Input.AXIS_X* rotationMultiplier);
  }

  move () {
    if (this.body.fixedRotation || this.onGround) {
      super.move();
    }
  }



}

export const name = 'Skater';
