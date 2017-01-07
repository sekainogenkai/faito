'use strict';

import BABYLON from 'babylonjs';

//http://pixelcodr.com/tutos/physics/game/index.html
export class Player {
  constructor(game, scene, keys, gamepad) {
    this.game = game;
    this.scene = game.scene;
    this.gamepad = gamepad;

    console.log(this.gamepad);
    /* MESH */
    this.box = BABYLON.Mesh.CreateBox("player", 5, this.scene);
    this.box.position.y = 2;
    this.body = this.box.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:1000, friction:0.001, restitution:1.5});
    var mat = new BABYLON.StandardMaterial("mat", this.scene);
    mat.diffuseColor = BABYLON.Color3.Blue();
    this.box.material = mat;

    // Movement directions : top, bot, left, right
    this.mvtDirection = [0,0,0,0];

    // The player speed
    this.speed = 0.5;

    /* KEYS */
    this.DIRECTIONS = {
      UP      : keys[0],
      DOWN    : keys[1],
      LEFT    : keys[2],
      RIGHT   : keys[3]
    };

    /* GAMEPAD*/
    var _this = this;
    this.scene.registerBeforeRender(function() {
        _this.update();
    });

    /* KEYBOARD */
    window.addEventListener("keyup", function(evt) {
        _this.handleKeyUp(evt.keyCode);
    });

    window.addEventListener("keydown", function(evt) {
        _this.handleKeyDown(evt.keyCode);
    });
  }

  update() {
      //if (this.gamepad){
        //this.handleControllerInput()
      //}
      this.move();
  }

  /**
   * Store the player direction.
   * Two directions are available : the movement direction
   * and the firing direction.
   * @private
   */
  _chooseDirection(direction, value) {
      this.mvtDirection[direction] = value;
  }

  move() {
      var s = 5;

      if (this.mvtDirection[0] != 0) { // Up and Down
          this.box.applyImpulse(new BABYLON.Vector3(0,0,s*this.mvtDirection[0]), this.box.position);
      }
      if (this.mvtDirection[1] != 0) { // Right and Left
          this.box.applyImpulse(new BABYLON.Vector3(s*this.mvtDirection[1],0,0), this.box.position);
      }
      this.body.linearVelocity.scaleEqual(0.92);
      this.body.angularVelocity.scaleEqual(0);
  }

  handleKeyDown(keycode) {
      switch (keycode) {
          case this.DIRECTIONS.UP:
              this._chooseDirection(0, 1);
              break;
          case this.DIRECTIONS.DOWN:
              this._chooseDirection(0, -1);
              break;
          case this.DIRECTIONS.LEFT:
              this._chooseDirection(1, -1);
              break;
          case this.DIRECTIONS.RIGHT:
              this._chooseDirection(1, 1);
              break;
      }
  }

  handleKeyUp(keycode) {
    switch (keycode) {
        case this.DIRECTIONS.UP:
            this._chooseDirection(0, 0);
            break;
        case this.DIRECTIONS.DOWN:
            this._chooseDirection(0, 0);
            break;
        case this.DIRECTIONS.LEFT:
            this._chooseDirection(1, 0);
            break;
        case this.DIRECTIONS.RIGHT:
            this._chooseDirection(1, 0);
            break;
    }
  }

  handleControllerInput() {
    this._chooseDirection(0, this.applyDeadzone(this.gamepad.axes[1], 0.25));
    this._chooseDirection(1, this.applyDeadzone(this.gamepad.axes[0], 0.25));
  }

  applyDeadzone(number, threshold) {
     var percentage = (Math.abs(number) - threshold) / (1 - threshold);

     if(percentage < 0)
        percentage = 0;

     return percentage * (number > 0 ? 1 : -1);
  }
  destroy() {
      this.box.dispose();
  }
}
