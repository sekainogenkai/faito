import BABYLON from 'babylonjs';

export default class Camera {
  constructor (game, radius) {
    this.game = game;
    // Set the target vector which will get updated
    this.initRadius = radius; // Used in setZoom
    console.log(this.initRadius);
    this.cameraTarget = new BABYLON.Vector3.Zero()
    this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, this.initRadius, this.cameraTarget, this.game.scene);
    this.camera.setPosition(new BABYLON.Vector3(0, 40, -40));
    // Set radius values
    this.radius = {
        current: 100,
        target: 100,
        min: 59,
    };

    // Add the update function to the scene
    this.game.scene.registerBeforeRender(() => this.update());
  }

  update () {
    this.setTarget();
    this.setZoom();
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
  }

  setZoom () {
    var maxDistance = 0;
    if (this.game.heroes) {
        this.game.heroes.forEach(function (hero) {
            maxDistance = Math.max(maxDistance, BABYLON.Vector3.Distance(new BABYLON.Vector3(hero.mask.position.x, 0, hero.mask.position.z), new BABYLON.Vector3(this.cameraTarget.x, 0, this.cameraTarget.z)));
        }, this);
        //console.log('maxDistance', maxDistance);
    }
      
    //console.log('maxDistance', maxDistance);
    this.camera.radius = Math.max(this.radius.min, 50 + maxDistance * 1.5); //TODO: vary zoom based on hero positions
  }
}
