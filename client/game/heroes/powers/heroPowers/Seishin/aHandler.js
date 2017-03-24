import BABYLON from 'babylonjs';

import {Buttons} from '../../../../input';

import PsychBlock from './psychBlock';
import JumpBall from '../baseHero/jumpBall';

const manaCostFreeze = 20;

export default class PowerHandler {
  constructor(game, hero) {
    this.game = game;
    this.hero = hero;

    this.jumpBall = new JumpBall(game, hero);
    this.psychBlock = new PsychBlock(game, hero);

    this.powerFreezeBool = false;
  }

  buttonDown(button) {
    switch (button) {
        case Buttons.A: this.jumpBall.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.X: this.psychBlock.buttonDown(0); this.hero.animatePower=true; break;
        case Buttons.B:
          this.powerFreezeBool = true;
          this.freezeObjects();
          this.hero.animatePower = true;
          break;

        case Buttons.Y:
          this.detachObjects();
          this.hero.animatePower = true;
          break;
    }
  }


  buttonUp(button) {
    switch (button) {
        case Buttons.A: this.jumpBall.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.X: this.psychBlock.buttonUp(0); this.hero.animatePower=false; break;
        case Buttons.B:
          this.powerFreezeBool = false;
          this.freezeObjects();
          this.hero.animatePower = false;
          break;
        case Buttons.Y:
          this.hero.animatePower = false;
          break;
    }
  }

  freezeObjects() {
    for (let object of this.psychBlock.objects) {
      if (this.powerFreezeBool) {
        // Freeze the object
        object.makeStatic();
        // Zero out all movement
        object.mesh.physicsImpostor.physicsBody.velocity.setZero();
        object.mesh.physicsImpostor.physicsBody.angularVelocity.setZero();
      } else {
        // Make the object active again
        object.makeKinematic(object.mass);
      }
    }
  }

  detachObjects() {
    for (let object of this.psychBlock.objects) {
      // Remove the joint on all objects
      object.removeJoint();
    }
  }

  update() {
    // must be called for all powers that remember objects
    this.psychBlock.deleteObjectsOnDeleteAnimation();
      if (this.powerFreezeBool) {
        // Constantly consume mana until there is none left
        if (!this.hero.consumeMana(manaCostFreeze)){
          this.powerFreezeBool = false;
          this.freezeObjects();
          this.hero.animatePower = false;
        }
      }
  }
}
