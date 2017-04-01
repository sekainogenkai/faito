import BABYLON from 'babylonjs';

export default class Camera {
  constructor (game) {
    this.game = game;
    // Set the target vector which will get updated
    this.initRadius = 100; // Used in setZoom
    this.radiusSpeed = 5;
    this.cameraTarget = new BABYLON.Vector3.Zero()
    this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.01, this.initRadius, this.cameraTarget, this.game.scene);
    this.camera.setPosition(new BABYLON.Vector3(0, 40, -40));
    // Set radius values
    this.radius = {
        current: 100,
        target: 100,
        min: 70,
    };

    // Add the update function to the scene
    this.game.scene.registerBeforeRender(() => this.update());
  }

  update () {
    if (!this.game.heroes) {
      return;
    }
    this.setTarget();
    this.setZoom();
  }

  setTarget () {
    var cx, cy, cz, mx, my, mz;
    cx = cy = cz = mx = my = mz = 0;
    var numHeroes = this.game.heroes.length || 1;
    for (let hero of this.game.heroes) {
      cx += hero.mask.position.x;
      cy += hero.mask.position.y;
      cz += hero.mask.position.z;
      // Set max x and z distances
      //var dx = hero.mask.position.x - this.cameraTarget.x;
      //var dy = hero.mask.position.y - this.cameraTarget.y;
    //  var dz = hero.mask.position.z - this.cameraTarget.z;
    //  mx = Math.max(mx, dx);
    //  my = Math.max(my, dy);
    //  mz = Math.max(mz, dz);
    };

    // Update center point
    this.cameraTarget.x = cx/numHeroes + 10;
    this.cameraTarget.z = cz/numHeroes;
    this.cameraTarget.y = cy/numHeroes;
  }

  setZoom () {
    let maxDistance = 0;
    //let maxHeight = this.game.heroes[0].mask.position.y;
    for (let hero of this.game.heroes) {
        maxDistance = Math.max(maxDistance, BABYLON.Vector3.Distance(new BABYLON.Vector3(hero.mask.position.x, hero.mask.position.y, hero.mask.position.z), new BABYLON.Vector3(this.camera.position.x, 0, this.camera.position.z)));
        //maxHeight = Math.max(maxHeight, hero.mask.position.y);
    };
        //console.log('maxDistance', maxDistance);

    //this.cameraTarget.z = this.cameraTarget.z + maxHeight;
    //console.log(maxHeight);
    //console.log('maxDistance', maxDistance);
    this.camera.radius = Math.max(this.radius.min, maxDistance * .9);// + maxHeight * 1.5;
  }
}
