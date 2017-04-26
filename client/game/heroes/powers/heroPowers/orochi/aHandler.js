import BABYLON from 'babylonjs';

import {getHeightAtCoordinates} from '../../powerUtils/mainUtils'

// Make the snake.
import SnakeMaker from './snakeMaker';
import {Buttons} from '../../../../input';

const snakeSpeed = 30;
const rideManaCost = 70;


export default class PowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;
    this.Input = {MOVEUP: false, MOVEDOWN: false};
    //this.spikeThrow = new SpikeThrow(game, hero);
    this.snakeMaker = new SnakeMaker(game, hero);
    this.rideSnakeBool = false;
  }

  buttonDown(button) {
    switch (button) {
        case Buttons.RB:
          this.Input.MOVEUP = true;
          break;

        case Buttons.LB:
          this.Input.MOVEDOWN = true;
          break;
        case Buttons.A:
          this.hero.moveBool = false;
          this.moveSnakeBool = true;
          this.updateSnakeMassProperties();
          this.hero.animatePower=true;
          break;
        case Buttons.B:

        break;
        case Buttons.X:
          this.addJointClosest();
          break;

        case Buttons.Y:
          this.snakeMaker.buttonDown(0);
          break;
    }
  }


  buttonUp(button) {
    switch (button) {
        case Buttons.RB:
          this.Input.MOVEUP = false;
          break;

        case Buttons.LB:
          this.Input.MOVEDOWN = false;
          break;

        case Buttons.A:
          this.hero.moveBool = true;
          this.hero.Input.JUMP = false;
          this.hero.Input.ROLL = false;
          this.moveSnakeBool = false;
          this.hero.animatePower = false;
          break;
        case Buttons.B:

          break;

        case Buttons.X:
          if (this.rideSnakeBool) { this.deleteJointClosest() };
          break;
        case Buttons.Y:
          this.snakeMaker.buttonUp(0);

          break;
    }
  }


  getSnakeObjectDistance(index) {
    let posHero = this.hero.mask.position;
    let posSnake = this.snakeMaker.objects[index].mesh.position;
    let xDiff = posSnake.x - posHero.x;
    let yDiff = posSnake.y - posHero.y;
    let zDiff = posSnake.z - posHero.z;
    return Math.sqrt(xDiff*xDiff + yDiff*yDiff + zDiff*zDiff);
  }

  addJointClosest() {
    if (this.snakeMaker.snakeExists()) {
      // find closest joint
      let indexClosest = 0;
      let closestDistance = Infinity;
      for (let i in this.snakeMaker.objects) {
        let distance = this.getSnakeObjectDistance(i);
        console.log('distance', distance);
        if (closestDistance > distance) {
          closestDistance = distance;
          indexClosest = i;
        }
      }
      console.log('index closest', indexClosest);
      // now attach closes to the player by the distance it got
      console.log('closest Distance = ', closestDistance);
      if (closestDistance < 10) {
        this.joint = new BABYLON.DistanceJoint( {maxDistance: closestDistance });
        this.hero.mask.physicsImpostor.addJoint(this.snakeMaker.objects[indexClosest].mesh.physicsImpostor, this.joint);
        this.indexClosest = indexClosest;
        this.rideSnakeBool = true;
      }
    }
  }

  deleteJointClosest() {
    console.log('detach');
    if (this.snakeMaker.snakeExists() && this.joint) {
      console.log('actually do that');
      console.log('indexClosest', this.indexClosest);
      console.log(this.snakeMaker.objects[this.indexClosest].mesh.phsyicsImpostor);
      console.log(this.snakeMaker.objects[this.indexClosest].mesh);
      console.log(this.snakeMaker.objects[this.indexClosest]);
      this.game.scene.getPhysicsEngine().removeJoint(
        this.hero.mask.physicsImpostor, this.snakeMaker.objects[this.indexClosest].mesh.physicsImpostor, this.joint);

      // Remove the joint from the targets list of joints
      this.hero.mask.physicsImpostor._joints = [];
      this.rideSnakeBool = false;
      /*.forEach(function(joint, i) {
        // Remove the joint if ids are similar
        if (joint.joint.physicsJoint.id = this.joint.physicsJoint.id) {
          this.hero.mask.physicsImpostor._joints.splice(i, 1);
        }
      }, this);*/
    }
  }

  updateSnakeMassProperties() {
    if (this.snakeMaker.snakeExists()) {//this.snakeMaker.objects[0] && this.snakeMaker.objects[0].lifeSpan > 0) {
      for(let snakeObj of this.snakeMaker.objects) {
        snakeObj.mesh.physicsImpostor.physicsBody.linearDamping = .9;
        snakeObj.mesh.physicsImpostor.physicsBody.angularDamping = .9;
        snakeObj.mesh.physicsImpostor.physicsBody.updateMassProperties();
      }
    }
  }

  moveSnake() {
    // move snake if it exists
    //console.log(this.snakeMaker.objects[0]);
    //console.log(this.snakeMaker.objects[0].lifeSpan);
    if (this.snakeMaker.snakeExists()) {//) [this.snakeMaker.objects[0] && this.snakeMaker.objects[0].lifeSpan > 0) {
      //console.log('moving the snake');
      //console.log(this.hero.Input.AXIS_X);
      let movementVector = new BABYLON.Vector3(this.hero.Input.AXIS_X,0,this.hero.Input.AXIS_Y);
      let normalizedMovementVector = movementVector.clone().normalize();
      movementVector = normalizedMovementVector.scale(snakeSpeed);
      if (this.Input.MOVEUP) {
        movementVector = movementVector.add(new BABYLON.Vector3(0, 40, 0));
      } else if (this.Input.MOVEDOWN) {
        //console.log('roll');
        movementVector = movementVector.add(new BABYLON.Vector3(0, -50, 0));
      }
      //console.log(this.snakeMaker.objects[0]);
      //console.log('movementVector', movementVector);
      this.snakeMaker.objects[0].mesh.applyImpulse(movementVector, this.snakeMaker.objects[0].mesh.position);
    }
  }


  update() {
    if (this.moveSnakeBool) {
      this.moveSnake();
    }

    if (this.snakeMaker.objects[0] && this.snakeMaker.objects[0].lifeSpan == 0) {
      this.deleteJointClosest();
    }

    if (this.rideSnakeBool && !this.hero.consumeMana(rideManaCost)) {
      this.deleteJointClosest();
    }
    // must be called for all powers that remember objects
    this.snakeMaker.deleteObjectsOnDeleteAnimation();

  }
}
