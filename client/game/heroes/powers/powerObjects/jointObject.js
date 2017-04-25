import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

export default class JointObject extends BasePowerObject {
  constructor(game, hero,
    // Base options
    optionsBase={mesh:null, vectorStart:null, vectorEnd:null, range:null, lifeSpan:null,
    dropHeight:0, dropRange:0, collisionCallBack:true, damageMult:10},
    // JointObject options
    options: {target:null, joint:null, mass:null} ) {

    super(game, hero, optionsBase);

    this.target = options.target; // The mesh we want to join to
    this.joint = options.joint; // the joint that is defined in the power class
    this.mass = options.mass;
  }

  onPowerSpawn() {
    this.makeKinematic(this.mass);
    // Attach the joint
    console.log(this.target.physicsImpostor);
    this.target.physicsImpostor.addJoint(this.mesh.physicsImpostor, this.joint);
  }

  onPowerDestroy() {
    // Remove the joint
    this.removeJoint();
  }

  removeJoint() {
    // http://www.html5gamedevs.com/topic/29237-how-to-properly-remove-physics-joint/#comment-168123
    this.hero.setRotation();
    console.log('removing joint');
    this.game.scene.getPhysicsEngine().removeJoint(this.target.physicsImpostor, this.mesh.physicsImpostor, this.joint);

    // Remove the joint from the targets list of joints
    this.target.physicsImpostor._joints.forEach(function(joint, i) {
      // Remove the joint if ids are similar
      if (joint.joint.physicsJoint.id = this.joint.physicsJoint.id) {
        this.target.physicsImpostor._joints.splice(i, 1);
      }
    }, this);
  }
}
