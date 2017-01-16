'use strict';

import BABYLON from 'babylonjs';

export default class testPower {
    constructor(game, hero) {
      this.game = game;
      this.scene = game.scene;
      this.hero = hero;
      this.id = this.hero.id;

      this.speed = 300; // Initial speed
      //this.mask.setPhysicsState(BABYLON.PhysicsEngine.NoImpostor); Allows collision but no movement
      this.scene.registerBeforeRender(() => {
          this.update();
      });
    }
    
    buttonDown() {
        
    }
    
    buttonPressed() {
        
    }
    
    buttonUp() {
        
    }

    update () {
      //this.body.linearVelocity.scaleEqual(0.92);
    }

}
