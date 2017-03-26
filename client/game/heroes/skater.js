import BABYLON from 'babylonjs';

import BaseHero from './baseHero';


import SkaterPowerHandler from './powers/heroPowers/skater/aHandler';


const upAxis = new CANNON.Vec3(0, 1, 0);
const onGroundPadding = 10;

export default class Skater extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:9, jumpStrength:130, rollGroundSpeed:18, rollAirSpeed:10},
    SkaterPowerHandler);
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
  }

  checkGround() {
    let skaterObject = this.powerHandler.powerSkateBoard.object;
    if (this.body.fixedRotation) {
      super.checkGround();
    } else if (skaterObject) {
      // check if hero hits the ground. Destroy the board if he does.

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
        if(collision && this.contactNormal.dot(upAxis) > 0.9){ // 0.5 is the threshold
          this.onGround = onGroundPadding;
          // Should we break the board?
          const boardRotationMatrix = new BABYLON.Matrix();
          skaterObject.mesh.rotationQuaternion.toRotationMatrix(boardRotationMatrix);
          const boardUpVector = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 1, 0), boardRotationMatrix);
          const contactNormalVector = BABYLON.Vector3.FromArray(this.contactNormal.toArray());
          const projection = BABYLON.Vector3.Dot(contactNormalVector, boardUpVector);
          // allow 45 degrees tollerance, number is: sin(90-45)
          if (projection < .4) {
            this.powerHandler.powerSkateBoard.object.lifeSpan -= this.powerHandler.powerSkateBoard.object.lifeSpan;
          } else {
            // First, calculate the current distance between the current rotation
            // and the next. http://math.stackexchange.com/a/167828
            const contactNormalDeviationFromUp = contactNormalVector.toQuaternion().multiply(new BABYLON.Vector3(0, 1, 0).toQuaternion().conjugateInPlace());
            const theta = 2 * Math.acos(skaterObject.mesh.rotationQuaternion.multiply(contactNormalDeviationFromUp.conjugateInPlace()).x);
            console.log('theta', theta);
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

    this.body.angularVelocity.set(this.Input.AXIS_Y* 2.2, 0, -this.Input.AXIS_X* 2.2);
  }

  move () {
    if (this.body.fixedRotation || this.onGround) {
      super.move();
    }
  }



}
