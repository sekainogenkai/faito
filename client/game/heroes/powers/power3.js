import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import BasePowerObject from './powerObjects/basePowerObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const directionVec = new BABYLON.Vector3(0, 0, -1);
const distance = 0;
const fixedRotation = true;
const meshSize = 10;


export default class Power3 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    // TODO: fix the mesh spawning at 0,0,0 and hitting the players, I forgot how to do that
    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/2) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/5),
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {mass:0, friction:0.1, restitution:4});
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
      mesh.receiveShadows = true;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }

      // run spawn
      new BasePowerObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 1, secondsToTicks(1));
    }

    buttonDown(i) {
      this.cursor = new PointCursor(this.game, this.hero, directionVec, distance, true);
    }

    buttonUp(i) {
      this.createMesh();
      this.cursor.destroy();
    }
}
