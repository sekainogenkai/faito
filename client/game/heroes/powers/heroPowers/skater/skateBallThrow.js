import BABYLON from 'babylonjs';
import {getHeightAtCoordinates, secondsToTicks} from '../../powerUtils/mainUtils';
import BasePower from '../../basePower';
import ProjectileObject from '../../powerObjects/projectileObject';

const manaCost = 400; // mana cost of the power
const collisionDamage = 5; // the amount of damage it does when it collides

//const cursorDirectionVec = new BABYLON.Vector3(0, 0, 1); // direction of the ball
const distance = -10; // cursor offset

const meshSize = 3;
const powerImpulseVec = new BABYLON.Vector3(0, 2000, 0); // impulse applied to projectile on spawn

/**
Shoots out a projectile at the enemy
**/
export default class Power2 extends BasePower {
    constructor(game, hero) {
      super(game, hero);
    }

    createMesh (personUpVector) {
      if (!personUpVector) {
        return;
      }
      console.log(personUpVector);
      const vecC = personUpVector.scale(8);
      // Set the target vector
      const vectorStart = new BABYLON.Vector3(
        this.hero.mask.position.x + vecC.x,
        this.hero.mask.position.y + vecC.y,
        this.hero.mask.position.z + vecC.z
      );

      const vectorEnd = vectorStart;

      // console.log('y position', this.hero.mask.position.y);

      // Create the mesh
      const mesh = new BABYLON.Mesh.CreateSphere('mesh', meshSize, meshSize, this.game.scene);
      mesh.position.copyFrom(vectorStart);

      mesh.physicsImpostor =
      new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, {mass:0, friction:.1, restitution:0.05}, this.game.scene);
      // run spawn
      new ProjectileObject(this.game, this.hero,
        // basePowerObject values
        {mesh:mesh, vectorStart:vectorStart, vectorEnd:vectorEnd, range:1, lifeSpan:secondsToTicks(2),
        dropHeight:10, dropRange:100, collisionCallBack:true, damageMult:10},
        // projectileObject values
        {vectorImpulse:powerImpulseVec, mass:50} );


      mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
      mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
    }

    buttonDown(personUpVector) {
      // Consume and check is there is enough mana
      if (!this.hero.consumeMana(manaCost)){
        return;
      }
      this.createMesh(personUpVector);
    }

    buttonUp(i) {
    }
}
