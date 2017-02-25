import BABYLON from 'babylonjs';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const directionVec = new BABYLON.Vector3(0, 0, 1);
const fixedRotation = false;
export default class Power1 {
    constructor(game, hero) {
      this.game = game;
      this.hero = hero;
      this.cursor = undefined;
    }

    // TODO: fix the mesh spawning at 0,0,0 and hitting the players, I forgot how to do that
    createMesh (position) {
      this.mesh = BABYLON.Mesh.CreateBox('mesh', 5, this.game.scene);
      this.mesh.position.copyFrom(this.cursor.mesh.position);
      BABYLON.Tags.EnableFor(this.mesh);
      BABYLON.Tags.AddTagsTo(this.mesh, "checkJump");
      this.mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
      this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(this.mesh);
      this.mesh.receiveShadows = true;
    }

    buttonDown(i) {
      this.cursor = new PointCursor(this.game, this.hero, directionVec, 10, true);
    }

    buttonUp(i) {
      this.createMesh();
      if (!fixedRotation) {
        this.setRotation(this.hero.mask.rotationQuaternion);
      }
      this.cursor.destroy();
      delete this.cursor;
    }

    setRotation (rotation) {
      // Set the mesh rotation to the rotation
      this.mesh.rotationQuaternion.copyFrom(rotation)
    }
}
