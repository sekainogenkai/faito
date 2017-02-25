import BABYLON from 'babylonjs';
import {getHeightAtCoordinates} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const directionVec = new BABYLON.Vector3(0, 0, 1);
const distance = 10;
const fixedRotation = false;
const meshSize = 5;

export default class Power1 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    // TODO: fix the mesh spawning at 0,0,0 and hitting the players, I forgot how to do that
    createMesh () {
      // Set the spawn vector
      this.spawnVec = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - meshSize - 3,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      this.targetVec = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + meshSize - 1,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      this.mesh = new BABYLON.Mesh.CreateBox('mesh', meshSize*2, this.game.scene);
      this.mesh.position.copyFrom(this.spawnVec);
      BABYLON.Tags.EnableFor(this.mesh);
      BABYLON.Tags.AddTagsTo(this.mesh, "checkJump");
      this.mesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, friction:0.1, restitution:0.9});
      this.mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(this.mesh);
      this.mesh.receiveShadows = true;

      // run spawn
      this.spawn(this.spawnVec, this.targetVec, 100);
    }

    buttonDown(i) {
      this.cursor = new PointCursor(this.game, this.hero, directionVec, distance, true);
    }

    buttonUp(i) {
      this.createMesh();
      this.game.scene.registerBeforeRender(() => this.update());
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
