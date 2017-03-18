import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();

export default class ProjectileObject extends BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, vectorImpulse,
              mass, damageMult=10) {
    super(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight, dropRange, true, damageMult)
    this.vectorImpulse = vectorImpulse;
    this.mass = mass;
    this.directionVec = new BABYLON.Vector3(0, 0, 0);
    // Get current rotation of player
    this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
  }

  onPowerSpawn() {
    this.makeKinematic(this.mass);

    BABYLON.Vector3.TransformCoordinatesToRef(this.vectorImpulse, matrix, this.directionVec);
    this.mesh.applyImpulse(this.directionVec, this.mesh.getAbsolutePosition());
  }
}
