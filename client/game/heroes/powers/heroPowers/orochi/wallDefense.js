import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import ProjectileObject from '../../powerObjects/projectileObject';
import PointCursor from '../../cursors/pointCursor';

const manaCost = 3000; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides
const mass = 1000;
const powerImpulseVec = new BABYLON.Vector3(0, 0, 0); // impulse applied to projectile on spawn
const distance = 15; // cursor scalar
const fixedRotation = false;
const meshSize = 8;

/*
* Makes a wall around the player for protection
*/
export default class WallDefense extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.cursors = [];
    }

    createMesh (cursor, index) {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, cursor.mesh.position.x, cursor.mesh.position.z)) - (meshSize/2) - 2,
        cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, cursor.mesh.position.x, cursor.mesh.position.z)) + (meshSize/2) + 2,
        cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshSize*1.5, meshSize, 2);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:0.01}, this.game.scene);
      // run spawn
      //new ProjectileObject(this.game, this.hero, mesh, vectorStart, vectorEnd, 10, secondsToTicks(5), 20, 200, powerImpulseVec, mass, collisionDamage);
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(3),
        dropHeight:20, dropRange:200, collisionCallBack:true, damageMult:collisionDamage},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:mass} );

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
        this.cursors.push(new PointCursor(this.game, this.hero,
          {direction: new BABYLON.Vector3(offset, 0, 0.8 - (0.5*Math.sin(Math.abs(offset)*Math.PI))), distance: distance, fixed: true} ));
        offset += 0.5;
      }
    }

    buttonUp(i) {
      // Check for cursor presence;
      if (this.cursors.length <= 0){
        return;
      }

      for (let cursor of this.cursors) {
        this.createMesh(cursor, this.cursors.indexOf(cursor));
        cursor.destroy();
      }

      this.cursors = [];
    }
}
