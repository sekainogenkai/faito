import BABYLON from 'babylonjs';

export default class Camera {
  constructor (game) {
    this.game = game;
    // Set the target vector which will get updated
    this.initRadius = 100; // Used in setZoom
    this.radiusSpeed = 5;
    this.cameraTarget = new BABYLON.Vector3.Zero()
    this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, this.initRadius, this.cameraTarget, this.game.scene);
    this.camera.setPosition(new BABYLON.Vector3(0, 100, -100));

    // Add the update function to the scene
    this.game.scene.registerBeforeRender(() => this.update());
  }

  update () {
    this.setTarget();
  }

  setTarget () {
    var cx, cz, mx, mz;
    cx = cz = mx = mz = 0;
    var numHeroes = this.game.heroes.length || 1;
    this.game.heroes.forEach(function (hero) {
      cx += hero.mask.position.x;
      cz += hero.mask.position.z;
      // Set max x and z distances
      var dx = hero.mask.position.x - this.cameraTarget.x
      var dz = hero.mask.position.z - this.cameraTarget.z
      mx = ((dx > mx) ? dx : mx);
      mz = ((dz > mz) ? dz : mz);
    }, this);

    // Update center point
    this.cameraTarget.x = cx/numHeroes;
    this.cameraTarget.z = cz/numHeroes;
    // Set zoom
    this.setRadius(mx, mz);
  }

  setRadius (mx, mz) { // Zoom
    this.camera.radius = 100; //TODO: vary zoom based on hero positions
  }
}
