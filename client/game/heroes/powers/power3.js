import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import BasePowerObject from './powerObjects/basePowerObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const manaCost = 100;

const directionVec = new BABYLON.Vector3(0, 0, -1);
const distance = 0;
const fixedRotation = true;
const meshSize = 10;

/**
* Jump Ball!
*/
export default class Power3 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

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
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0, friction:0.1, restitution:4}, this.game.scene);
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
      mesh.receiveShadows = true;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }

      // run spawn
      new BasePowerObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 1, secondsToTicks(1), 10, 100);
    }

    buttonDown(i) {
      // consume and check to see if there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }

      this.cursor = new PointCursor(this.game, this.hero, directionVec, distance, true);
    }

    buttonUp(i) {
      // Make sure a cursor is present
      if (!this.cursor){
        return;
      }

      this.createMesh();
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
