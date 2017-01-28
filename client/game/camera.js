import BABYLON from 'babylonjs';
import {registerAfterSceneRender, registerBeforeSceneRender} from './mesh-util';

export default class Camera {
  constructor (game, radius, minRad, maxRad ) {
    this.game = game;
    // Set the target vector which will get updated
    this.initRadius = radius; // Used in setZoom
    this.cameraTarget = new BABYLON.Vector3.Zero()
    this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, this.initRadius, this.cameraTarget, this.game.scene);
    this.camera.setPosition(new BABYLON.Vector3(0, 40, -40));
    // Set camera properties
    this.camera.lowerRadiusLimit = minRad;
    this.camera.upperRadiusLimit = maxRad;
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
    //this.setZoom(mx, mz);
  }

  setZoom (mx, mz) {
    this.camera.radius = this.initRadius; //TODO: vary zoom based on hero positions
  }
}
