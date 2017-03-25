import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import ProjectileObject from '../../powerObjects/projectileObject';
import DirectionCursor from '../../cursors/directionCursor';
import PointCursor from '../../cursors/pointCursor';
import JoyCursor from '../../cursors/joyCursor';

const manaCost = 100; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides

//const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = -10; // cursor offset

const meshSize = 1.5;
const powerImpulseVec = new BABYLON.Vector3(0, 400, 1200); // impulse applied to projectile on spawn

const throwBetweenTimerMax = 9;

/**
Shoots out a projectile at the enemy
**/
export default class BallThrow extends BasePower {
    constructor(game, hero) {
      super(game, hero);
      this.attacking = false;
      this.throwBetweenTimer = throwBetweenTimerMax;
      this.throwSidewaysDistance = 2.2;
    }

    createMesh (cursor) {
      // Set the spawn vector
      const vectorStart = new BABYLON.Vector3(
        cursor.mesh.position.x,
        (getHeightAtCoordinates(this.groundMesh, cursor.mesh.position.x, cursor.mesh.position.z)) - (meshSize) - 2,
        cursor.mesh.position.z
      );

      // Set the target vector
      const vectorEnd = new BABYLON.Vector3(
        cursor.mesh.position.x,
        Math.max((getHeightAtCoordinates(this.groundMesh, cursor.mesh.position.x, cursor.mesh.position.z)) + 1,
        this.hero.mask.position.y + 1),
        cursor.mesh.position.z
      );
      // console.log('y position', this.hero.mask.position.y);

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);
      BABYLON.Tags.EnableFor(mesh);
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0, friction:2, restitution:0.01}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:8, lifeSpan:secondsToTicks(1.5),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:1},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:50} );


      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
    }

    buttonDown(i) {
      // Consume and check is there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }
      this.hero.slowDown = 2.8;
      this.attacking = true;
      this.throwBetweenTimer = 60;

      this.cursor = new PointCursor(this.game, this.hero,
        {direction: new BABYLON.Vector3(-this.throwSidewaysDistance,0, -4), distance: 5, fixed: true});
    }

    update() {
      // Check timer
      if (this.throwBetweenTimer > 0) {
        this.throwBetweenTimer--;
        return;
      }

      if (!this.attacking || !this.hero.consumeMana(manaCost)) {
        return;
      }
      this.throwSidewaysDistance *= -1;
      this.cursor.changeDirectionVec(new BABYLON.Vector3(this.throwSidewaysDistance,0,-4));
      this.throwBetweenTimer = throwBetweenTimerMax;
      this.createMesh(this.cursor);
    }

    buttonUp(i) {
      this.attacking = false;
      this.hero.slowDown = 1;
      // Check for cursor presence
      // console.log(this.cursors);
      this.cursor.destroy();
    }
}
