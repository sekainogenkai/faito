import BABYLON from 'babylonjs';
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';
//import ParticleEmitter from '../../../particle';

const zeroVector = new BABYLON.Vector3.Zero();

// Collided with timer. I like objects.
class CollidedWith {
  constructor(player, timerMax=10) {
    this.player = player;
    this.timerMax = timerMax;
    this.timer = this.timerMax; // TODO make this an option or something. Idk
  }

  subtractTimer() {
    if (this.timer>0) {
      this.timer--;
    }
  }

  checkCollide() {
    let checkCollideBool = this.timer <= 0;
    if (checkCollideBool) {
      this.timer = this.timerMax;
    }
    return checkCollideBool;
  }
}

export default class BasePowerObject {
  constructor(game, hero,
    // options
    options={mesh:null, vectorStart:null, vectorEnd:null, range:null, lifeSpan:null,
      dropHeight:0, dropRange:0, collisionCallBack:true,
      damageMult:10, damageTimerMax:10} ) {

    let mesh = options.mesh;
    this.game = game;
    this.hero = hero;
    this.mesh = mesh;
    // Material copy form parent
    this.mesh.material = this.hero.mesh.material;

    // setup mesh impostor
    this.collidedWith = [];

    if (options.collisionCallBack) {
      this.damageMult = options.damageMult;
      this.mesh.physicsImpostor.onCollide = this.onPowerCollide.bind(this);
      mesh.physicsImpostor.forceUpdate();
    }

    this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
    mesh.receiveShadows = true;

    // console.log('vectorstart', vectorStart);
    this.vectorStart = options.vectorStart;
    this.vectorEnd = options.vectorEnd;
    this.range = options.range;
    this.lifeSpan = options.lifeSpan;
    this.dropHeight = options.dropHeight;
    this._currentState = 0;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
    this.dropRange = options.dropRange;
    this.damageTimerMax = options.damageTimerMax?options.damageTimerMax:10;

    /*
    this.dustParticleEmitter = new ParticleEmitter(this.game, 'dustParticle', './textures/effects/circle.png',
      new BABYLON.Vector3(0, 0, 0), //position
      new BABYLON.Vector3(30, 0, -30), //directionwdw
      new BABYLON.Vector3(-30, 0, 30), //direction
      new BABYLON.Vector3(0,-1,0), //gravity
      this.hero.mesh.material.diffuseColor,
      this.hero.mesh.material.diffuseColor);
      this.dustParticleEmitter.emitConstant(20, new BABYLON.Vector3(this.vectorEnd.x, getHeightAtCoordinates(this.groundMesh, this.vectorEnd.x, this.vectorEnd.z) + 1, this.vectorEnd.z));
      */
      this.spawn();
      registerBeforeSceneRender(mesh, () => this.update());
  }


  update() {
    this.objectCollideTimerSubtract();

    if (this._currentState == 0) {
    } else if (this._currentState == 1) {
      // main update loop of power
      this.powerUpdate();
    } else if (this._currentState == 2) {

    }
  }

  powerUpdate() {
    if (this.lifeSpan) {
      this.lifeSpan--;
    } else {
      this._currentState = 2;
      this.destroy();
    }

  }

  spawn() {
    const spawnEndEvent = new BABYLON.AnimationEvent(this.range, () => {
      //this.dustParticleEmitter.stop();
      // Switch to powerUpdate state
      this.onPowerSpawn();
      this._currentState = 1;
    });

    this.moveAnimation('spawn', spawnEndEvent);
  }

  destroy() {
    if (this.mesh.physicsImpostor.physicsBody.type != 0) {
      this.makeStatic();
    }

    this.range = this.dropRange;
    const destroyEndEvent = new BABYLON.AnimationEvent(this.range, () => {
      //console.log('End animation event!');
      this.onPowerDestroy();
      this.mesh.dispose();
    });

    this.vectorStart = this.mesh.position;
    this.vectorEnd = this.mesh.position.clone();
    this.vectorEnd.y = getHeightAtCoordinates(this.groundMesh, this.vectorEnd.x, this.vectorEnd.z) - (this.dropHeight?this.dropHeight:this.mesh.getBoundingInfo().boundingBox.extendSize.y);

    //console.log('what is the range', this.dropRange);

    this.moveAnimation('destroy', destroyEndEvent);
  }

  moveAnimation(animationName, endEvent) {
    //console.log('start pos', this.vectorStart);
    //console.log('end pos', this.vectorEnd);
    var moveAnimation = new BABYLON.Animation(
      animationName, 'position', 60,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3);

    moveAnimation.addEvent(endEvent);
    var moveAnimationKeys = [
      {
        frame: 0,
        value: this.vectorStart,
      },
      {
        frame: this.range,
        value: this.vectorEnd,
      },
    ];
    // Set the keys
    moveAnimation.setKeys(moveAnimationKeys);
    this.mesh.animations = [];
    this.mesh.animations.push(moveAnimation);

    this.game.scene.beginAnimation(this.mesh, 0, this.range, false);
  }

  makeKinematic(mass) {
    if (this._currentState != 2) { //making an object kinematic during the destruction pahse would be bad
      this.collidedWith = []; // so it can collide with player after spawn
      this.mesh.physicsImpostor.physicsBody.type = 1; // Make the object kinematic
      this.mesh.physicsImpostor.physicsBody.mass = mass;
      this.mesh.physicsImpostor.physicsBody.updateMassProperties();
      this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupGround | this.game.scene.collisionGroupNormal;
    }
  }

  makeStatic() {
    this.mesh.physicsImpostor.physicsBody.type = 0; // Make the object not kinematic
    this.mesh.physicsImpostor.physicsBody.mass = 0;
    this.mesh.physicsImpostor.physicsBody.updateMassProperties();
    this.mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal;
  }

  onPowerSpawn() {
    // Called when power is spawned
  }

  onPowerDestroy() {
    // Called when power is destroyed
  }

  onPowerCollide(e) {
    // Called when object collides
    // Uses Cannon.js vectors
    if (BABYLON.Tags.HasTags(e.body) && e.body.matchesTagsQuery("hero") && e.body.parent.name != this.hero.name && this.checkHeroCollidedWith(e.body.parent.name)) {
        // e.body.parent is the hero that the object is colliding with

        let contactVelocity = new BABYLON.Vector3();

        contactVelocity.copyFrom(this.mesh.physicsImpostor.getLinearVelocity());

        // If it does not have a velocity calculate it.
        if ( contactVelocity.equals(zeroVector) ) {
          contactVelocity = this.vectorEnd.subtract(this.vectorStart);
          let magnitude = contactVelocity.length();
          contactVelocity.normalize().scaleInPlace(magnitude/this.range);
        }

        let cannonContactVelocity = this.babylonToCannonVector(contactVelocity);
        // apply the damage
        e.body.parent.takeDynamicDamage(this.damageMult, Math.abs(cannonContactVelocity.dot(e.contact.ni)));

        if (this.checkHeroAlreadyCollidedWith(e.body.parent.name) == 'newHero') {
          //console.log('newHero collided with');
          this.collidedWith.push(new CollidedWith(e.body.parent.name, this.damageTimerMax));
        }
    }
  }

  // collided with objects have timer until they are collided with again
  objectCollideTimerSubtract() {
    for (let collided of this.collidedWith) {
      collided.subtractTimer();
    }
  }

  checkHeroAlreadyCollidedWith(playerContacted) {
    //console.log(this.collidedWith);
    for (let collided of this.collidedWith) {
      if (collided.player == playerContacted) {
        return collided.checkCollide();
      }
    }
    return 'newHero';
  }

  checkHeroCollidedWith(playerContacted) {
    let check = this.checkHeroAlreadyCollidedWith(playerContacted)
    if (check != 'newHero') {
      // console.log('return check', check);
      return check;
    }
    return true;
  }

  babylonToCannonVector(babylonVec) {
      return new CANNON.Vec3(babylonVec.x, babylonVec.y, babylonVec.z);
  }
}
