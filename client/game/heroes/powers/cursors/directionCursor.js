import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'

const matrix = new BABYLON.Matrix();

export default class DirectionCursor extends BaseCursor {
    constructor(game, hero, options={direction:null, speed:null}) {
      super(game, hero);
      this.initialDirectionVec = options.direction;
      this.directionVec = new BABYLON.Vector3(0, 0, 0);
      // Get current rotation of player
      this.hero.mask.rotationQuaternion.toRotationMatrix(matrix);
      BABYLON.Vector3.TransformCoordinatesToRef(this.initialDirectionVec, matrix, this.directionVec);
      // scale the vector to the speed
      this.directionVec.scaleInPlace(options.speed);
    }

    update () {
      if (this.directionVec) {
          this.mesh.position.addInPlace(this.directionVec);
      }

      super.update();
    }
}
