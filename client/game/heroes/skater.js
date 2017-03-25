import BaseHero from './baseHero'

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
  }

  checkGround() {
    let skaterObject = this.powerHandler.powerSkateBoard.object;
    if (this.body.fixedRotation) {
      super.checkGround();
    } else if (skaterObject) {

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
        if(collision && this.contactNormal.dot(upAxis) > 0.8){ // 0.5 is the threshold
          this.onGround = onGroundPadding;
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

}
