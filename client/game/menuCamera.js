import BABYLON from 'babylonjs';

export default class MenuCamera {
  constructor (game) {
    this.game = game;
    // Set the target vector which will get updated
    // Set radius values
    this.radius = {
        max: 100,
        min: 50
    };
    this.cameraTarget = new BABYLON.Vector3.Zero()
    this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0.1, this.radius.max, this.cameraTarget, this.game.scene);
    this.camera.setPosition(new BABYLON.Vector3(0, 40, -40));

    // add animations
    this.setAnimation("alpha", 0, 12, 2500, "relative");
    this.setAnimation("beta", 5, 5.5, 1000, "cycle");
    this.setAnimation("radius", this.radius.max, this.radius.min, 2000, "cycle");

  }

  setAnimation(prop, startVal, endVal, range, loopType) {
    var keys = [];
    var loopMode = undefined;
    keys.push({
        frame: 0,
        value: startVal
    });
    if (loopType == "relative") {
      keys.push({
          frame: range,
          value: endVal
      });
      loopMode = BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE;
    } else if (loopType == "cycle") {
      keys.push({
          frame: range/2,
          value: endVal
      });
      keys.push({
          frame: range,
          value: startVal
      });
      loopMode = BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE;
    }
    var animCamera = new BABYLON.Animation("anim" + prop, prop, 60,
                                      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                                      loopMode);


    animCamera.setKeys(keys);
    this.camera.animations.push(animCamera);
    this.game.scene.beginAnimation(this.camera, 0, range, true);
  }
}
