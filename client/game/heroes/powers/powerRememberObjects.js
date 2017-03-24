import BABYLON from 'babylonjs';
import BasePower from './basePower.js';

export default class PowerRemember extends BasePower {
  constructor(game, hero) {
    super(game, hero);

    this.objects = [];
  }

  addObject(object) {
    this.objects.push(object);
  }

  deleteObjectsOnDeleteAnimation() {
    for (let i in this.objects) {
      if (this.checkDead(this.objects[i])) {
        //console.log('deleting');
        this.objects.splice(i, 1);
        console.log(this.objects.length);
      }
    }
  }

  checkDead(object) {
    return object._currentState == 2;
  }

}
