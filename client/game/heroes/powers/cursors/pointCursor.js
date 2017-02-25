import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'

const initialDirectionVec = new BABYLON.Vector3(0, 0, 1);
const matrix = new BABYLON.Matrix();

export default class PointCursor extends BaseCursor {
    constructor(game, hero, direction, distance=1, fixed=true) {
      super(game, hero);
      this._fixed = fixed;
      this._distance = distance;
      this._initialDirectionVec = direction;
      this._directionVec = new BABYLON.Vector3(0, 0, 0);
      var initialVec = this.hero.mask.physicsImpostor.getLinearVelocity();
      this.mesh.applyImpulse(initialVec.normalize().scale(distance), this.mesh.getAbsolutePosition());
      // set the point
      this.setPoint();
    }

    update () {
      if (this._fixed) {
        this.mesh.position.x = this.hero.mask.position.x;
        this.mesh.position.y = this.hero.mask.position.y;
        this.mesh.position.z = this.hero.mask.position.z;
        this.setPoint();
      }
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
