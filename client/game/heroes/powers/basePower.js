'use strict';

import BABYLON from 'babylonjs';

export default class testPower {
    constructor(game, hero) {
      this.game = game;
      this.scene = game.scene;
      this.hero = hero;
      this.id = this.hero.id;


    }

    usePower() {

    }

    update () {
      //this.body.linearVelocity.scaleEqual(0.92);
    }

}
