import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();

export default class ProjectileObject extends BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, vectorImpulse, mass=1) {
    super(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan)
    this.vectorImpulse = vectorImpulse;
    this.directionVec = new BABYLON.Vector3(0, 0, 0);
    this.mass = mass;
    // Get current rotation of player
    this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
  }

  onPowerSpawn() {
    this.mesh.physicsImpostor.physicsBody.type = 1; // Make the object kinematic
<<<<<<< HEAD
    this.mesh.physicsImpostor.physicsBody.mass = this.mass;
=======
>>>>>>> a1e789070226dcec61a03acb0c97a305380564c5
    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupGround | this.game.scene.collisionGroupNormal;

    BABYLON.Vector3.TransformCoordinatesToRef(this.vectorImpulse, matrix, this.directionVec);
    this.mesh.applyImpulse(this.directionVec, this.mesh.getAbsolutePosition());
  }

  destroy() {
    this.mesh.physicsImpostor.physicsBody.type = 0; // Make the object kinematic
    this.mesh.physicsImpostor.physicsBody.mass = 0;
    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
    super.destroy();
  }
}
