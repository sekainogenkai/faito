import BABYLON from 'babylonjs';
import {registerBeforeSceneRender} from '../../../mesh-util'
import {getHeightAtCoordinates} from '../powerUtils/mainUtils';
import ParticleEmitter from '../../../particle';

const zeroVector = new BABYLON.Vector3.Zero();

export default class BasePowerObject {
  constructor(game, hero, mesh, vectorStart, vectorEnd, range, lifeSpan, dropHeight=0, dropRange=0,
              collisionCallBack=true, damageMult=10) {
    this.game = game;
    this.hero = hero;
    this.mesh = mesh;

    // setup mesh impostor
    this.collisionActive = false;
    if (collisionCallBack) {
      this.collisionActive = true;
      this.damageMult = damageMult;
      this.mesh.physicsImpostor.onCollide = this.onPowerCollide.bind(this);
      mesh.physicsImpostor.forceUpdate();
    }

    this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
    mesh.receiveShadows = true;

    // console.log('vectorstart', vectorStart);
    this.vectorStart = vectorStart;
    this.vectorEnd = vectorEnd;
    this.range = range;
    this.lifeSpan = lifeSpan;
    this.dropHeight = dropHeight;
    this._currentState = 0;
    this.groundMesh = this.game.scene.getMeshesByTags('heightFieldImpostor')[0];
    this.dropRange = dropRange?dropRange:range;

    this.dustParticleEmitter = new ParticleEmitter(this.game, 'dustParticle', './textures/effects/circle.png',
      new BABYLON.Vector3(0, 0, 0), //position
      new BABYLON.Vector3(30, 0, -30), //directionwdw
      new BABYLON.Vector3(-30, 0, 30), //direction
      new BABYLON.Vector3(0,-1,0), //gravity
      new BABYLON.Color3(1, 1, 1),
      new BABYLON.Color3(1, 1, 1));
    this.dustParticleEmitter.emitConstant(20, new BABYLON.Vector3(this.vectorEnd.x, getHeightAtCoordinates(this.groundMesh, this.vectorEnd.x, this.vectorEnd.z) + 1, this.vectorEnd.z));

    this.spawn();
    registerBeforeSceneRender(mesh, () => this.update());
  }


  update() {
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
      this.dustParticleEmitter.stop();
      this.collisionActive = false; // stops the object from colliding with player after moving
      // Switch to powerUpdate state
      this.onPowerSpawn();
      this._currentState = 1;
    });

    this.moveAnimation('spawn', spawnEndEvent);
  }

  destroy() {
    this.range = this.dropRange;
    const destroyEndEvent = new BABYLON.AnimationEvent(this.range, () => {
      //console.log('End animation event!');
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

  onPowerSpawn() {
    // Called when power is spawned
  }

  onPowerCollide(e) {
    // Called when object collides
    // Uses Cannon.js vectors
    if (BABYLON.Tags.HasTags(e.body) && e.body.matchesTagsQuery("hero") && e.body.parent.name != this.hero.name && this.collisionActive) {
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

        this.collisionActive = false;
    }
  }

  babylonToCannonVector(babylonVec) {
      return new CANNON.Vec3(babylonVec.x, babylonVec.y, babylonVec.z);
  }
}
