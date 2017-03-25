import BABYLON from 'babylonjs';
import BaseCursor from './baseCursor.js'
import {rotateFromHero} from '../powerUtils/mainUtils';

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

    changeDirectionVec(directionVec) {
      this._initialDirectionVec = directionVec;
    }

    update () {
      if (this._fixed) {
        this.mesh.position.copyFrom(this.hero.mask.position);
        this.setPoint();
      }

      super.update();
    }

    setPoint () {
      // add the vector once
      this.mesh.position.addInPlace(
        rotateFromHero(this.hero, this._initialDirectionVec, this._distance));
    }
}
