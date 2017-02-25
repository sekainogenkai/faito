import BABYLON from 'babylonjs';
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';
import {registerBeforeSceneRender} from '../../../mesh-util';

export default class BaseCursor {
    constructor(game, hero) {
      this.game = game;
      this.hero = hero;
      this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
      // Create the cursor
      this.mesh = BABYLON.Mesh.CreateSphere("cursor", 5, 1, this.game.scene);
      var material = new BABYLON.StandardMaterial("red_material", this.game.scene);
      material.diffuseColor = BABYLON.Color3.Red();
      this.mesh.material = material;
      // set position to the player
      this.mesh.position.copyFrom(this.hero.mask.position);
      registerBeforeSceneRender(this.mesh, () => this.update());
    }

    update () {
      this.mesh.position.y = getHeightAtCoordinates(this.groundMesh, this.mesh.position.x, this.mesh.position.z)
    }

    destroy() {
      this.mesh.dispose();
    }
}
