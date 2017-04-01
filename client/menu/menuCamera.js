import BABYLON from 'babylonjs';

export default class MenuCamera {
  constructor (game) {
    this.game = game;
    // Set the target vector which will get updated
    this.initRadius = 100; // Used in setZoom
    this.cameraSpeed = 5;
    this.cameraTarget = new BABYLON.Vector3.Zero()
    this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0.1, this.initRadius, this.cameraTarget, this.game.scene);
    this.camera.setPosition(new BABYLON.Vector3(0, 40, -40));
    // Set radius values
    this.radius = {
        current: 100,
        target: 100,
        min: 70,
    };
    // add animations
    this.setAnimation(this.camera.alpha, 12, 1000);
    this.setAnimation(this.camera.beta, 12, 1500);
  }

  setAnimation(prop, endVal, range=100,) {
    var animCamera = new BABYLON.Animation("animCam", "alpha", 30,
                                      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                                      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var keys = [];
    keys.push({
        frame: 0,
        value: prop
    });
    keys.push({
        frame: range,
        value: endVal
    });
    animCamera.setKeys(keys);
    this.camera.animations.push(animCamera);
    this.game.scene.beginAnimation(this.camera, 0, range, false);
  }
}
