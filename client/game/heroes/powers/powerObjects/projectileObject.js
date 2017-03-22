import BABYLON from 'babylonjs';
import BasePowerObject from './basePowerObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();

export default class ProjectileObject extends BasePowerObject {
  constructor(game, hero,
    // Base options
    baseOptions={mesh:null, vectorStart:null, vectorEnd:null, range:null, lifeSpan:null,
    dropHeight:0, dropRange:0, collisionCallBack:true, damageMult:10},
    // ProjectileObject options
    options={vectorImpulse:null, mass:null} ) {

    super(game, hero, baseOptions);

    this.vectorImpulse = options.vectorImpulse;
    this.mass = options.mass;
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
