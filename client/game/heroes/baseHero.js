import BABYLON from 'babylonjs';
import {EventSubscriptionContext} from '../../event-util';
import {Buttons} from '../input';
import {registerBeforeSceneRender} from '../mesh-util';
import testPower from './powers/testPower';
import testPower2 from './powers/testPower2';
import testPower3 from './powers/testPower3';
import testPower4 from './powers/testPower4';

const zeroVector2 = new BABYLON.Vector2(0, 0);
const maxMana = 5000;
const maxHealth = 5000;

export default class Hero {
  constructor(
    game, name, meshFileName='omi', speed=20, airSpeed=5, jumpStrength=150, rollGroundSpeed=30, rollAirSpeed=20,
    attack1=testPower, attack2=testPower4, attack3=testPower3, attack4=testPower,
    defense1=testPower, defense2=testPower, defense3=testPower, defense4=testPower){
    this.game = game;
    this.name = name;
    this._mana = maxMana;
    this._health = maxHealth;
    this._joyTarget = this;

    // Get physics impostor ready
    this.initCollider();

    // Create the mana bar
    this.manaBar = this._initDisplayBar("mana", 0.3, 2, 20, BABYLON.Color3.Blue());
    this.healthBar = this._initDisplayBar("health", 0.3, 2.5, 20, BABYLON.Color3.Red());

    require(`../../../models/heroes/${meshFileName}.blend`).ImportMesh(BABYLON.SceneLoader, null, this.game.scene, loadedMeshes => {
        // Add the mesh
        this.mesh = loadedMeshes[0];//.clone(this.name); // 2 is the index of the player mesh
        // console.log("the player mesh", this.mesh);
        this.mesh.isVisible = true;

        // outline
        this.mesh.outlineWidth = .1;
        this.mesh.renderOutline = true;
        this.mesh.outlineColor = new BABYLON.Color4(0,0,0, .01);
        this.mesh.outlineAlpha = .1;

        this.mesh.id = this.name;
        this.mesh.parent = this.mask;
        this.mesh.position.y = -3  + 1.9 - .1;
        this.mesh.position.z = .6;
        // Add the player mesh to the shadowGenerator
        this.game.shadowGenerator.getShadowMap().renderList.push(this.mesh);
        this.mesh.receiveShadows = true;

        // Add material for debug
        var material = new BABYLON.StandardMaterial("blue_material", game.scene);
        material.diffuseColor = BABYLON.Color3.Blue();
        this.mesh.material = material;
        this.initAnimations();
    });

    // Movement variables
    this.onGround = false;
    this.jumpStrength = jumpStrength;
    this.jumpTimerStart = 20;
    this.jumpTimer = this.jumpTimerStart;
    this.rollTimerStart = 15;
    this.rollTimer = this.rollTimerStart;
    this.speed = speed;
    this.airSpeed = airSpeed;
    this.moveBool = true;
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

    this.defense1 = new defense1(game, this);
    this.defense2 = new defense2(game, this);
    this.defense3 = new defense3(game, this);
    this.defense4 = new defense4(game, this);

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
      this.jumpAnimation = this.mesh.skeleton.getAnimationRange('jump');
      this.powerAnimation = this.mesh.skeleton.getAnimationRange('ability');
      this.rollAnimation = this.mesh.skeleton.getAnimationRange('roll');
      this.rollingAnimation = this.mesh.skeleton.getAnimationRange('rolling');
      const animatable = this.game.scene.beginAnimation(this.mesh.skeleton, 0, 120, true, 2);
      setTimeout(() => {
          animatable.speedRatio /= 8;
      }, 4000);

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
        // walk animation
        var magnitude =
        Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.z * this.body.velocity.z);
        if (this.rollTimer) {
                if (magnitude > 1) { // roll animation
                    this.startAnimationNew(this.rollingAnimation, true, 10);
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
            } else if (magnitude < 5) { // Walk animation
                this.startAnimationNew(this.walkAnimation);
                this.currentAnimatable.speedRatio = .31 * magnitude;
            } else { // Run animation
                this.startAnimationNew(this.runAnimation);
                this.currentAnimatable.speedRatio = .9 + .02 * magnitude;
            }
      } else {
          this.startAnimationNew(this.jumpAnimation);
          this.currentAnimatable.speedRatio = .8;
      }
  }

  initCollider (width=2) {
    // Merges three spheres to create a capsule
    const detail = 10;

    // Create collision mask m0
    this.mask = this.createSphere('m0', detail, 2.5, 0, 4, .2, .01);

    // create collision mask m1
    this.mask1 = this.createSphere('m1', detail, 2.3, 1.9, 1, .05, .2);
    this.body1 = this.mask1.physicsImpostor.physicsBody;
    //this.body1.fixedRotation = true;
    this.mask1.parent = this.mask;

    // Create collision mask m2
    this.mask2 = this.createSphere('m2', detail, 2, 1.9+1.7, 1, .05, .2);
    this.body2 = this.mask2.physicsImpostor.physicsBody;
    //this.body2.fixedRotation = true;
    this.mask2.parent = this.mask;
    //this.body2.type = 2;

    this.updatePhysicsImpostor();
    this.updateMassProperties();

    this.initGroundCheck();

    console.log('mask', this.mask);
    const visible = false;
    this.mask.isVisible = visible;
    this.mask1.isVisible = visible;
    this.mask2.isVisible = visible;
    this.mask.position.y = 20;

    console.log('body', this.mask.physicsImpostor.physicsBody);
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
    impostorBody.collisionFilterGroup = this.game.collisionGroupNormal;
    impostorBody.collisionFilterMask = this.game.collisionGroupGround | this.game.collisionGroupNormal | this.game.collisionGroupFall;
  }

  initGroundCheck() {
    // Create mesh for onGround collision check
    this.groundCheck = BABYLON.Mesh.CreateBox("mask", 2.5, this.game.scene);
    this.groundCheck.isVisible = false;
    this.groundCheck.parent = this.mask;
    this.groundCheck.position.y = -3 + 1.9 -.2;
    this.groundCheck.scaling.y = 0.3;
  }

  checkGroundCheck() {
    //TODO: http://schteppe.github.io/cannon.js/examples/threejs_voxel_fps.html use this jump check logic
    // Check for ground
    this.onGround = false;
    this.game.scene.getMeshesByTags("checkJump").forEach(function (mesh) {
      if (this.groundCheck.intersectsMesh(mesh, true)){
        this.mesh.material.diffuseColor = new BABYLON.Color3.Red();
        this.onGround = true;
      }
    }, this);
  }

  update () {
    this.checkGroundCheck();

    if (this.moveBool) {
        this.move();
    }

    this.animations();

    this._manageMana();
    this._udpateDisplayBar(this.healthBar, (this._health/maxHealth)); //TODO: put into manageHealth function
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
            this.mask.applyImpulse(new BABYLON.Vector3(slowDown * this.body.velocity.x, slowDown * this.body.velocity.y, slowDown * this.body.velocity.z), this.mask.position);
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
        movementVector = movementVector.add(new BABYLON.Vector3(0,this.jumpStrength,0));
        this.mesh.material.diffuseColor = BABYLON.Color3.Blue();
        this.jumpTimer = this.jumpTimerStart;
    } else if (this.jumpTimer > 0) {
        this.jumpTimer--;
    }
    this.Input.JUMP = false;

    // apply movement at the very end.
    //console.log('ONGROUND:', this.onGround);
    this.mask.applyImpulse(movementVector, this.mask.position);

    if (this.body.velocity.length() > 1 && (this.Input.AXIS_X || this.Input.AXIS_Y) ) {
        this.setRotation();
    }
  }

  setRotation () {
    // Player rotation
    this.mask.rotationQuaternion = BABYLON.Quaternion.RotationYawPitchRoll(Math.atan2(this.body.velocity.x, this.body.velocity.z), 0, 0);
  }

  setPlayer(player) {
    (this._inputSubscriptions || {destroy: () => {}}).destroy();
    if (!player) {
      return;
    }
    this._inputSubscriptions = new EventSubscriptionContext(player.input)
      .on('end', () => this.setPlayer())
      .on('joychanged', joyVector => this.handleJoyChanged(joyVector))
      .on('buttondown', button => this.handleButtonDown(button))
      .on('buttonup', button => this.handleButtonUp(button))
    ;
  }

  handleJoyChanged(joyVector) {
      this._joyTarget.joyChanged(joyVector);
  }

    /**
     * Allow the hero to act as a joy target. When this gets
     * called, that means that the hero itself should respond
     * to joy and, e.g., move.
     */
    joyChanged(joyVector) {
        this.Input.AXIS_Y = joyVector.y;
        this.Input.AXIS_X = joyVector.x;
    }

  _handleButton(button, pressed) {
    switch (button) {
    }
  }

  handleButtonDown(button) {
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

  handleButtonUp(button) {
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
    bar.position.y -= 1;
  }

    _manageMana() {
        if (this._mana < maxMana) {
            this._mana = Math.min(maxMana, this._mana + ((this.mask.physicsImpostor.getLinearVelocity().length() < 1)?this.manaGainIdle:this.manaGainMoving));
        }
        this._udpateDisplayBar(this.manaBar, (this._mana/maxMana));

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

    /**
     * Sets the joy target. The joy target must have a joyChanged
     * function accepting a Vector2. If null the hero will start
     * responding to joy again.
     */
    setJoyTarget(target) {
        target = target || this;
        // Send 0 to original target to set it to rest or whatever
        // instead of leaving it stuck at other value. For existing,
        // will stop movement in the hero.
        this.handleJoyChanged(zeroVector2);
        this._joyTarget = target;
        // Emit 0 to help target with preinitializing itself.
        this.handleJoyChanged(zeroVector2);
    }
}
