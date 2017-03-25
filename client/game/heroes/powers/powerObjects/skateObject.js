import BABYLON from 'babylonjs';
import BasePowerObject from './jointObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

export default class JointObject extends BasePowerObject {
  constructor(game, hero,
    // Base options
    optionsBase={mesh:null, vectorStart:null, vectorEnd:null, range:null, lifeSpan:null,
    dropHeight:0, dropRange:0, collisionCallBack:true, damageMult:10},
    // JointObject options
    optionsJoint: {target:null, joint:null, mass:null} ) {

    super(game, hero, optionsBase, optionsJoint);

    this.hero = hero;
  }


  removeJoint() {
    // http://www.html5gamedevs.com/topic/29237-how-to-properly-remove-physics-joint/#comment-168123
    this.hero.updateMassProperties();
    this.hero.setRotation(true);
    this.hero.freezeHero();
    this.hero.slowDown = 1;
    this.game.scene.getPhysicsEngine().removeJoint(this.target.physicsImpostor, this.mesh.physicsImpostor, this.joint);
  }
}
