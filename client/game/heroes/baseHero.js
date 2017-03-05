import BABYLON from 'babylonjs';
import {EventSubscriptionContext} from '../../event-util';
import {Buttons} from '../input';
import {registerBeforeSceneRender} from '../mesh-util';
import ParticleEmitter from '../particle';

import Power1 from './powers/power1';
import Power2 from './powers/power2';
import Power3 from './powers/power3';
import Power4 from './powers/power4';

const upAxis = new CANNON.Vec3(0, 1, 0);
const zeroVector2 = new BABYLON.Vector2(0, 0);
const maxMana = 5000;
const maxHealth = 500;
const onGroundPadding = 10;

export default class Hero {
  constructor(
    game, name, meshFileName='omi', speed=12, airSpeed=4, jumpStrength=150, rollGroundSpeed=20, rollAirSpeed=10,
    attack1=Power1, attack2=Power2, attack3=Power3, attack4=Power4){
    this.game = game;
    this.name = name;
    this._mana = maxMana;
    this._health = maxHealth;
      /**
       * For sort of treating the hero to act as a joy target. When
       * this gets called, that means that the hero itself should
       * respond to joy and, e.g., move.
       */
      this._joyTarget = this.heroJoyTarget = {
          joyChanged: joy => {
              this.Input.AXIS_X = joy.x;
              this.Input.AXIS_Y = joy.y;
          }
      };

    // Get physics impostor ready
    this.initCollider();

    this.mask.physicsImpostor.physicsBody.parent = this;
    // Add Tags
    BABYLON.Tags.EnableFor(this.mask.physicsImpostor.physicsBody);
    BABYLON.Tags.AddTagsTo(this.mask.physicsImpostor.physicsBody, "hero");
    console.log(this.mask.physicsImpostor.physicsBody.id)

    this.nameTag = this._initNameTag(name)

    // Create the mana bar
    this.manaBar = this._initDisplayBar("mana", 0.3, 2, 20, BABYLON.Color3.Blue());
    this.healthBar = this._initDisplayBar("health", 0.3, 2.5, 20, BABYLON.Color3.Red());

    require(`../../../models/heroes/${meshFileName}.blend`).ImportMesh(BABYLON.SceneLoader, null, this.game.scene, loadedMeshes => {
        // Add the mesh
        this.mesh = loadedMeshes[0];//.clone(this.name); // 2 is the index of the player mesh
        // console.log("the player mesh", this.mesh);
        this.mesh.isVisible = true;

        this.mesh.id = this.name;
        this.mesh.parent = this.mask;
        this.mesh.position.y = -3  + 1.9 - .1;
        this.mesh.position.z = .6;
        // Add the player mesh to the shadowGenerator
        this.game.scene.shadowGenerator.getShadowMap().renderList.push(this.mesh);
        this.mesh.receiveShadows = true;

        this.initAnimations();
    });

    // Movement variables
    //this.mask.physicsImpostor.onGround = false;
    this.contactNormal = new CANNON.Vec3(); // Used in the onGround calculation
    this.onGround = onGroundPadding;
    this.jumpStrength = jumpStrength;
    this.jumpTimerStart = 20;
    this.jumpTimer = this.jumpTimerStart;
    this.rollTimerStart = 15;
    this.rollTimer = this.rollTimerStart;
    this.speed = speed;
    this.airSpeed = airSpeed;
    this.moveBool = true;
    this.powerBool = true;
    this.dead = false;
    this.rollGroundSpeed = rollGroundSpeed;
    this.rollAirSpeed = rollAirSpeed;
    this.useAbilityTimer = 0;
    this.useAbilityTimerStart = 20;
    // Mana variables
    this.manaGainIdle = 10;
    this.manaGainMoving = 1;

    // Input
    this.Input = {
      AXIS_X : 0,
      AXIS_Y : 0,
      JUMP : false,
      ROLL : false,
    };

    // InitializePowers
    this.attack1 = new attack1(game, this);
    this.attack2 = new attack2(game, this);
    this.attack3 = new attack3(game, this);
    this.attack4 = new attack4(game, this);

    // Add particle emitters for stuff
    this.dustParticleEmitter = new ParticleEmitter(this.game, 'dustParticle', './textures/effects/circle.png');
    // Add update loop to Babylon
    registerBeforeSceneRender(this.mesh, () => {
        this.update();
    });
  }

  initAnimations () {
      //console.log('animation range', this.mesh.skeleton.getAnimationRange('run'));
      this.idleAnimation = this.mesh.skeleton.getAnimationRange('idle');
      this.walkAnimation = this.mesh.skeleton.getAnimationRange('walk');
      this.runAnimation = this.mesh.skeleton.getAnimationRange('run');
      this.jumpUpAnimation = this.mesh.skeleton.getAnimationRange('jumpUp');
      this.jumpDownAnimation = this.mesh.skeleton.getAnimationRange('jumpDown');
      this.powerAnimation = this.mesh.skeleton.getAnimationRange('ability');
      this.rollAnimation = this.mesh.skeleton.getAnimationRange('roll');
      this.rollingAnimation = this.mesh.skeleton.getAnimationRange('rolling');
      this.deathAnimation = this.mesh.skeleton.getAnimationRange('death');
      const animatable = this.game.scene.beginAnimation(this.mesh.skeleton, 0, 120, true, 2);
      /*
      setTimeout(() => {
          animatable.speedRatio /= 8;
      }, 4000);
      */
      this.currentAnimation = null;
      this.currentAnimatable = null;

      this.animatePower = false;
  }

  startAnimationNew(animation, loop=true, blending=.1) {
      if (this.currentAnimation != animation) {
          this.startAnimation(animation, loop, blending);
      }
  }

  startAnimation (animation, loop=true, blending=.1) {
      this.currentAnimation = animation;
      this.currentAnimatable = this.game.scene.beginAnimation(this.mesh.skeleton, animation.from+1, animation.to, loop, 1);
      this.currentAnimatable.enableBlending(blending);
  }

  animations () {
        if (this.dead) {
          this.startAnimationNew(this.deathAnimation, false, 10);
          this.currentAnimatable.speedRatio = .5;
        }


        // walk animation
        var magnitude =
        Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.z * this.body.velocity.z);

        if (this.rollTimer) {
                if (magnitude > 1) { // roll animation
                    this.startAnimationNew(this.rollingAnimation, false, 1);
                    this.currentAnimatable.speedRatio = 2.6;
                } else { // duck animation
                    this.startAnimationNew(this.rollAnimation, false);
                    this.currentAnimatable.speedRatio = 2;
                }
        } else if (this.onGround) {
            //console.log("mag: ", magnitude);
            if (magnitude < 1) {// Idle Animation
                if (!this.animatePower) {
                    this.startAnimationNew(this.idleAnimation);
                } else { // Power animation
                    this.startAnimationNew(this.powerAnimation, false);
                    this.currentAnimatable.speedRatio = 1.5;
                }
            } else if (magnitude < 9) { // Walk animation
                this.startAnimationNew(this.walkAnimation);
                this.currentAnimatable.speedRatio = .34 * magnitude;
            } else { // Run animation
                this.startAnimationNew(this.runAnimation);
                this.currentAnimatable.speedRatio = .9 + .02 * magnitude;
            }
      } else {
          // jump up
          if (this.body.velocity.y >=0) {
            this.startAnimationNew(this.jumpUpAnimation, false);
          } else {
              // jump down
              this.startAnimationNew(this.jumpDownAnimation, false);
          }
          this.currentAnimatable.speedRatio = .8;

      }
  }

  initCollider (width=2) {
    // Merges three spheres to create a capsule
    const detail = 10;

    // Create collision mask m0
    this.mask = this.createSphere('m0', detail, 2.3, 0, 4, 0.05, .01);

    // create collision mask m1
    this.mask1 = this.createSphere('m1', detail, 2.3, 1.9, 1, 0, .2);
    this.body1 = this.mask1.physicsImpostor.physicsBody;
    //this.body1.fixedRotation = true;
    this.mask1.parent = this.mask;

    // Create collision mask m2
    this.mask2 = this.createSphere('m2', detail, 2, 1.9+1.7, 1, 0, .2);
    this.body2 = this.mask2.physicsImpostor.physicsBody;
    //this.body2.fixedRotation = true;
    this.mask2.parent = this.mask;
    //this.body2.type = 2;

    this.updatePhysicsImpostor();
    this.updateMassProperties();

    const visible = false;

    this.mask.isVisible = visible;
    this.mask1.isVisible = visible;
    this.mask2.isVisible = visible;
    this.mask.position.y = 20;

    //console.log('body', this.mask.physicsImpostor.physicsBody);
  }

  updatePhysicsImpostor () {
    this.mask.physicsImpostor.forceUpdate();
    this.body = this.mask.physicsImpostor.physicsBody;
    this.addCollisionToGroup(this.body);
  }

  updateMassProperties () {
    this.body.linearDamping = .8;
    this.body.fixedRotation = true;
    this.body.sleepSpeedLimit = .1;
    this.body.updateMassProperties();
  }

  createSphere (name, detail, size, posY, mass, friction, restitution) {
      // Make sphere mesh
      let sphere = BABYLON.Mesh.CreateSphere(name, detail, size, this.game.scene);
      // Set sphere position
      sphere.position.y += posY;
      sphere.computeWorldMatrix(true);
      // Create collision mask
      sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {mass:mass, friction:friction, restitution:restitution}, this.game.scene);
      return sphere;
  }

  addCollisionToGroup (impostorBody) {
    impostorBody.collisionFilterGroup = this.game.scene.collisionGroupNormal;
    impostorBody.collisionFilterMask = this.game.scene.collisionGroupGround | this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupFall;
  }

  checkGround() {
    if (this.onGround > 0) {
      this.onGround -= 1;
    }
    this.mask.physicsImpostor.physicsBody.world.contacts.forEach(function(contact) {
      //http://schteppe.github.io/cannon.js/examples/threejs_voxel_fps.html
      var collision = false;
      if (contact.bi.id == this.mask.physicsImpostor.physicsBody.id) {
        contact.ni.negate(this.contactNormal);
        collision = true;
      } else if (contact.bj.id == this.mask.physicsImpostor.physicsBody.id){
        this.contactNormal.copy(contact.ni);
        collision = true;
      }
      if(collision && this.contactNormal.dot(upAxis) > 0.6){ // 0.5 is the threshold
        this.onGround = onGroundPadding;
      }
    }, this);
  }

  update () {
    //console.log(this.mask.physicsImpostor.physicsBody.world.contacts);
    this.checkGround();

    if (this.moveBool) {
        this.move();
    }

    this.animations();

    this._manageMana();
    this._manageHealth();
  }

  // use this to make xbox controller movement is smoove and doesn't go over the speed limit
  getScaleSpeed (movementVector, speed) {
      //console.log('movementvector strength:', movementVector.length());
      return speed * Math.min(1, movementVector.length());
  }

  move () {
    // get normalized vector
    var movementVector = new BABYLON.Vector3(this.Input.AXIS_X,0,this.Input.AXIS_Y);
      //console.log('xbox move:', this.Input.AXIS_X, ', ', this.Input.AXIS_Y, ', scaleSpeed:', Math.min(1, movementVector.length()));
    var normalizedMovementVector = movementVector.clone().normalize();
    //console.log('scale speed:', this.getScaleSpeed(movementVector, this.speed));

    // Rolling is very important
    if (this.Input.ROLL && this.rollTimer == 0) {
        this.rollTimer = this.rollTimerStart;

    } else if (this.rollTimer > 0) {
        this.rollTimer--;
        // Slow the movement after rolling is done
        if (this.rollTimer == 0) {
            let slowDown = -3;
            this.mask.applyImpulse(new BABYLON.Vector3(slowDown * this.body.velocity.x, this.body.velocity.y, slowDown * this.body.velocity.z), this.mask.position);
        }
    }
    this.Input.ROLL = false;
    //console.log(this.rollTimer);

    // Movement on ground
    if (this.onGround) {
        movementVector = normalizedMovementVector.scale(this.getScaleSpeed(movementVector, this.rollTimer? this.rollGroundSpeed:this.speed));
    } else { // Movement in air
        movementVector = normalizedMovementVector.scale(this.getScaleSpeed(movementVector, this.rollTimer? this.rollAirSpeed:this.airSpeed));
        if (this.body.velocity.y < 0) {
            movementVector = movementVector.add(new BABYLON.Vector3(0,-5,0));
        }
        if (this.rollTimer) {
            movementVector = movementVector.add(new BABYLON.Vector3(0, -5,0 ));
        }
    }

    // Jump
    if (this.onGround && this.Input.JUMP && this.jumpTimer == 0) {
        //console.log("jump!");
        this.onGround = false;
        movementVector = movementVector.add(new BABYLON.Vector3(0,this.jumpStrength,0));
        this.jumpTimer = this.jumpTimerStart;
        this.game.scene.sound.jump.play();
        // Emit
        this.dustParticleEmitter.emitManual(6, new BABYLON.Vector3(this.mask.position.x, this.mask.position.y - 0.5, this.mask.position.z));
    } else if (this.jumpTimer > 0) {
        this.jumpTimer--;
    }
    this.Input.JUMP = false;

    // apply movement at the very end.
    //console.log('ONGROUND:', this.mask.physicsImpostor.onGround);
    this.mask.applyImpulse(movementVector, this.mask.position);

    if (this.body.velocity.length() > 1 && (this.Input.AXIS_X || this.Input.AXIS_Y) ) {
        this.setRotation();
    }
  }

  setRotation () {
    // Player rotation
    this.mask.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.atan2(this.body.velocity.x, this.body.velocity.z), 0, 0);
  }

    joyChanged(joyVector) {
      this._joyTarget.joyChanged(joyVector);
  }

  _handleButton(button, pressed) {
    switch (button) {
    }
  }

  buttonDown(button) {
    if (!this.powerBool) {
      return;
    }
    this._handleButton(button, true);
    switch (button) {
        case Buttons.RB: this.Input.JUMP = true; break;
        case Buttons.LB: this.Input.ROLL = true; break;
        case Buttons.A: this.attack1.buttonDown(0); this.animatePower=true; break;
        case Buttons.B: this.attack2.buttonDown(0); this.animatePower=true; break;
        case Buttons.X: this.attack3.buttonDown(0); this.animatePower=true; break;
        case Buttons.Y: this.attack4.buttonDown(0); this.animatePower=true; break;
    }
  }

  buttonUp(button) {
    if (!this.powerBool) {
      return;
    }
    this._handleButton(button, false);
    switch (button) {
        case Buttons.A: this.attack1.buttonUp(0); this.animatePower=false; break;
        case Buttons.B: this.attack2.buttonUp(0); this.animatePower=false; break;
        case Buttons.X: this.attack3.buttonUp(0); this.animatePower=false; break;
        case Buttons.Y: this.attack4.buttonUp(0); this.animatePower=false; break;
    }
  }
  _initDisplayBar (id, width, radius, tessellation, color) {
    //http://www.babylonjs-playground.com/#RF9W9#453
    var shape = [
      new BABYLON.Vector3(width, 0, 0),
      new BABYLON.Vector3(0, 0, 0),
    ];
    // material
    var material = new BABYLON.StandardMaterial(id+"Material", this.game.scene);
    material.alpha = 0.5;
    material.diffuseColor = color;
    material.ambientColor = color;
    material.specularColor = color;
    material.backFaceCulling = false;

    var path = [];
    var step = Math.PI * 2 / (tessellation-1.2); // -1.2 so that the circle closes
    for(var i = 0; i < tessellation; i++) {
      var point = new BABYLON.Vector3(-radius * Math.cos(step * i), 0, -radius * Math.sin(step * i));
      path.push(point);
    }
    var bar = BABYLON.Mesh.ExtrudeShapeCustom(id+"Display", shape, path, null, null, false, false, 0, this.game.scene, true);
    bar.material = material;
    bar.tessellation = tessellation;
    bar.path = path;
    bar.shape = shape;
    bar.radius = radius;

    return bar;
  }

    _udpateDisplayBar (bar, displayValue) {
      //http://www.babylonjs-playground.com/#1MSEBT#3
      // Displays the mana bar
      var step = ((Math.PI * 2) / (bar.tessellation-1.2)) * (displayValue);
      for(var i = 0; i < bar.path.length; i++) {
        var x = -bar.radius * Math.cos(step * i);
        var z = -bar.radius * Math.sin(step * i);
        bar.path[i].x = x;
        bar.path[i].z = z;
      }
      bar = BABYLON.Mesh.ExtrudeShapeCustom(null, bar.shape, bar.path, null, null, null, null, null, null, null, null, bar);
      bar.position.copyFrom(this.mask.position); // We don't parent the bar to the mask so it has a fixed rotation
      bar.position.y += .2;
    }

    _manageMana() {
        if (this._mana < maxMana) {
            this._mana = Math.min(maxMana, this._mana + ((this.mask.physicsImpostor.getLinearVelocity().length() < 1)?this.manaGainIdle:this.manaGainMoving));
        }
        this._udpateDisplayBar(this.manaBar, (this._mana/maxMana));
    }

    _manageHealth() {
        this._udpateDisplayBar(this.healthBar, (this._health/maxHealth));
    }

    _initNameTag(name) {
      /* TODO: fix this
      var wsc = new BABYLON.WorldSpaceCanvas2D(this.game.scene, new BABYLON.Size(8, 3), {
            id: name,
            unitScaleFactor: 10,
            trackNodeOffset: new BABYLON.Vector3(8, 8, 0),
            trackNodeBillboard: true,
            trackNode: this.mask,
            worldPosition: new BABYLON.Vector3(0, 0, 0),
            backgroundFill: "#8080F040",
            backgroundRoundRadius: 10,
            children: [
                new BABYLON.Text2D(name, { fontName: "10pt Arial", marginAlignment: "h: center, v: center", fontSignedDistanceField: true })
            ]
        });
        */
    }

    /**
     * Returns false if there is insufficient mana.
     */
    consumeMana(amount) {
        if (this._mana < amount) {
            return false;
        }

        this.useAbilityTimer = this.useAbilityTimerStart;

        this._mana -= amount;
        return true;
    }

    takeDamage(amount) {
        if (this._health < amount) {
            this._health = 0;
            this.onDeath();
            return false;
        }

        this._health -= amount;
        return true;
    }

    takeDynamicDamage(damage, contact) {
        this.takeDamage(damage * contact);
    }

    /**
     * function accepting a Vector2. If null the hero will start
     * responding to joy again.
     */
    setJoyTarget(target) {
        target = target || this.heroJoyTarget;
        // Send 0 to original target to set it to rest or whatever
        // instead of leaving it stuck at other value. For existing,
        // will stop movement in the hero.
        this.joyChanged(zeroVector2);
        this._joyTarget = target;
        // Emit 0 to help target with preinitializing itself.
        this.joyChanged(zeroVector2);
    }

    onDeath() {
        this.moveBool = false;
        this.powerBool = false;
        this.dead = true;
    }
}
