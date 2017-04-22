import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import PowerRemember from '../../powerRememberObjects';
import BasePowerObject from '../../powerObjects/basePowerObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 1500; // mana cost of the power
const collisionDamage = 10; // the amount of damage it does when it collides
const maxItems = 2;
const directionVec = new BABYLON.Vector3(0, 0, 1); // position of the cursor
const distance = 10; // cursor scalar

const fixedRotation = false;
const meshSize = 10;

/*
* Makes a block using joy cursor
*/
export default class Power1 extends PowerRemember {
    constructor(game, hero) {
      super(game, hero, maxItems);
    }

    createMesh () {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) - (meshSize/2) - 2,
        this.cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        this.cursor.mesh.position.x,
        (getHeightAtCoordinates(this.game.scene, this.cursor.mesh.position.x, this.cursor.mesh.position.z)) + (meshSize/2) - 6,
        this.cursor.mesh.position.z
      );

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateBox('mesh', 1, this.game.scene);
      mesh.scaling = new BABYLON.Vector3(meshSize, meshSize*3, 5);
      console.log(mesh.material);
      mesh.position.copyFrom(vectorStart);


      BABYLON.Tags.EnableFor(mesh);
      BABYLON.Tags.AddTagsTo(mesh, "checkJump");

      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.BoxImpostor, {mass:0, friction:0.1, restitution:0.9}, this.game.scene);
      // run spawn
      this.addObject(new BasePowerObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:10, lifeSpan:secondsToTicks(10),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:collisionDamage}));

      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
      if (!fixedRotation) {
        mesh.rotationQuaternion.copyFrom(this.hero.mask.rotationQuaternion);
        mesh.rotation.x += Math.PI/3.5;
      }
    }

    buttonDown(i) {
      // Consume and check to see if there is enough mana or if we have max items
      if ( this.powerIsFull() || !this.hero.consumeMana(manaCost)){
        return;
      }

      this.cursor = new JoyCursor(this.game, this.hero, {speed:1});
    }

    buttonUp(i) {
      // Check for cursor presence;
      if (!this.cursor){
        return;
      }

      this.createMesh();
      this.cursor.destroy();
      this.cursor = undefined;
    }
}
