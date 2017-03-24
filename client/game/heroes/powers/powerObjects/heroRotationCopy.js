import BABYLON from 'babylonjs';
import ProjectileObject from './projectileObject'
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates, rotateFromHero} from '../powerUtils/mainUtils';

const matrix = new BABYLON.Matrix();

export default class heroRotationCopy extends ProjectileObject {
  constructor(game, hero,
    // Base options
    baseOptions={mesh:null, vectorStart:null, vectorEnd:null, range:null, lifeSpan:null,
    dropHeight:0, dropRange:0, collisionCallBack:true, damageMult:10},
    // ProjectileObject options
    projectileOptions={vectorImpulse:null, mass:null, usePlayerRot:false} ) {

    super(game, hero, baseOptions, projectileOptions);
  }

  animatingOnMake() {
    this.mesh.rotation.x += .1;
  }
}
