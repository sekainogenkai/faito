import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

export default class JointObject extends BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, target, joint,
              mass, damageMult=10) {
    super(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, true, damageMult);
    this.mass = mass;
    this.target = target; // The mesh we want to join to
    this.joint = joint; // the joint that is defined in the power class
  }

  onPowerSpawn() {
    this.makeKinematic(this.mass);
    // Attach the joint
    console.log(this.target.physicsImpostor);
    console.log(this.target.physicsImpostor.addJoint);
    this.target.physicsImpostor.addJoint(this.mesh.physicsImpostor, this.joint);
  }

  onPowerDestroy() {
    // Remove the joint
    // http://www.html5gamedevs.com/topic/29237-how-to-properly-remove-physics-joint/#comment-168123
    this.game.scene.getPhysicsEngine().removeJoint(this.target.physicsImpostor, this.mesh.physicsImpostor, this.joint);
  }
}
