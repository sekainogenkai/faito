import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from './powerUtils/mainUtils';
import BasePower from './powers/basePower';
import ProjectileObject from './powerObjects/projectileObject';
import DirectionCursor from './cursors/directionCursor';
import PointCursor from './cursors/pointCursor';
import JoyCursor from './cursors/joyCursor';

const manaCost = 1000; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides
const mass = 1000;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 0); // impulse applied to projectile on spawn

const distance = 15; // cursor scalar

const fixedRotation = false;
const meshSize = 8;

/*
* Makes a wall around the player, can be moved once the button is released
*/
export default class Power1 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.powerObjs = [];
    }

    createMesh (cursor, index) {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, cursor.mesh.position.x, cursor.mesh.position.z)) - (meshSize/2) - 2,
        cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, cursor.mesh.position.x, cursor.mesh.position.z)) + (meshSize/2) + 2,
        cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshSize*1.5, meshSize, 2);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:0}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(5), 0, 0, powerImpulseVec, mass, collisionDamage);
      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
      }
      // Rotate to get a nice circular wall formation
      switch (index) {
        case 0:
          mesh.rotation.y += 70;
        case 2:
          mesh.rotation.y += 20;
      }
    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }
      // Create three walls that protect the player
      this.cursors = [];
      var offset = -0.5;
      for (let i = 0; i < 3; i++) {
        this.cursors.push(new PointCursor(this.game, this.hero, new BABYLON.Vector3(offset, 0, 0.8 - (0.5*Math.sin(Math.abs(offset)*Math.PI))), distance, true));
        offset += 0.5;
      }
    }

    buttonUp(i) {
      // Check for cursor presence;
      if (this.cursors.length <= 0){
        return;
      }

      this.cursors.forEach(function(cursor, i) {
        this.createMesh(cursor, i);
      }, this)

      for (let cursor of this.cursors) {
        cursor.destroy();
      }
      this.cursors = [];
    }
}
