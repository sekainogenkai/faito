import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();

export default class ProjectileObject extends BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, vectorImpulse,
              collisionCallBack=true, damageMult=10) {
    super(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, collisionCallBack, damageMult)
    this.vectorImpulse = vectorImpulse;
    this.directionVec = new BABYLON.Vector3(0, 0, 0);
    // Get current rotation of player
    this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
  }

  onPowerSpawn() {
    this.mesh.physicsImpostor.physicsBody.type = 1; // Make the object kinematic

    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupGround | this.game.scene.collisionGroupNormal;

    BABYLON.Vector3.TransformCoordinatesToRef(this.vectorImpulse, matrix, this.directionVec);
    this.mesh.applyImpulse(this.directionVec, this.mesh.getAbsolutePosition());
  }

  destroy() {
    this.mesh.physicsImpostor.physicsBody.type = 0; // Make the object not kinematic
    this.mesh.physicsImpostor.physicsBody.mass = 0;
    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
    super.destroy();
  }

}
