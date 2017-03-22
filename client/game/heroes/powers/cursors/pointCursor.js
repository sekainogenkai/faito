import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'

const initialDirectionVec = new BABYLON.Vector3(0, 0, 1);
const matrix = new BABYLON.Matrix();

export default class PointCursor extends BaseCursor {
    constructor(game, hero, options={direction:null, distance:1, fixed:true}) {
      super(game, hero);
      this._fixed = options.fixed;
      this._distance = options.distance;
      this._initialDirectionVec = options.direction;
      this._directionVec = new BABYLON.Vector3(0, 0, 0);
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      // set the point
      this.setPoint();
    }

    update () {
      if (this._fixed) {
        this.mesh.position.copyFrom(this.hero.mask.position);
        this.setPoint();
      }

      super.update();
    }

    setPoint () {
      // Get current rotation of player
      this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
      BABYLON.Vector3.TransformCoordinatesToRef(this._initialDirectionVec, matrix, this._directionVec);
      this._directionVec.scaleInPlace(this._distance);
      // add the vector once
      this.mesh.position.addInPlace(this._directionVec);
    }
}
