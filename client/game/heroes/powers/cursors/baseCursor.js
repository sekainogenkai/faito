import BABYLON from 'babylonjs';

export default class BaseCursor {
    constructor(game, hero) {
      this.game = game;
      this.hero = hero;
      // Create the cursor
      this.mesh = BABYLON.Mesh.CreateSphere("cursor", 5, 1, this.game.scene);
      var material = new BABYLON.StandardMaterial("red_material", this.game.scene);
      material.diffuseColor = BABYLON.Color3.Red();
      this.mesh.material = material;
      // set position to the player
      this.mesh.position.copyFrom(this.hero.mask.position);
      this.game.scene.registerBeforeRender(() => this.update());
    }

    update () {}

    destroy() {
      this.mesh.dispose();
    }
}
