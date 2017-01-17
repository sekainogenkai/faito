import BABYLON from 'babylonjs';
import {EventSubscriptionContext} from '../../event-util';
import {Buttons} from '../input';
import testPower from './powers/testPower';
import testPower2 from './powers/testPower2';
import testPower3 from './powers/testPower3';

const zeroVector2 = new BABYLON.Vector2(0, 0);
const maxMana = 5000000;

export default class Hero {
  constructor(
    game, name, meshFileName='omi', speed=30, airSpeed=10, jumpStrength=250,
    attack1=testPower, attack2=testPower2, attack3=testPower3, attack4=testPower,
    defense1=testPower, defense2=testPower, defense3=testPower, defense4=testPower){
    this.game = game;
    this.name = name;
      this._mana = maxMana;
      this._joyTarget = this;

    // Create collision mask
    this.mask = this.initCapsule(2,4);
    this.mask.isVisible = false;

    require(`../../../models/heroes/${meshFileName}.blend`).ImportMesh(BABYLON.SceneLoader, null, this.game.scene, loadedMeshes => {
        // Add the mesh
        this.mesh = loadedMeshes[0];//.clone(this.name); // 2 is the index of the player mesh
        // console.log("the player mesh", this.mesh);
        this.mesh.isVisible = true;
        this.mesh.id = this.name;
        this.mesh.parent = this.mask;
        this.mesh.position.y = -3;
        // Add the player mesh to the shadowGenerator
        this.game.shadowGenerator.getShadowMap().renderList.push(this.mesh);
        this.mesh.receiveShadows = true;
        // Add material for debug
        var material = new BABYLON.StandardMaterial("blue_material", game.scene);
        material.diffuseColor = BABYLON.Color3.Blue();
        this.mesh.material = material;

        this.initAnimations();
    });


    // Create the physics body using mask TODO: Make the Impostor a capsule
    this.body = this.mask.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:10, friction:0.05, restitution:0.5});
    this.body.collisionFilterGroup = this.game.collisionGroupNormal;
    this.body.collisionFilterMask = this.game.collisionGroupGround | this.game.collisionGroupNormal | this.game.collisionGroupFall;

    this.updateMassProperties();

    this.initGroundCheck();


    // Movement variables
    this.onGround = false;
    this.jumpStrength = jumpStrength;
    this.jumpTimerStart = 20
    this.jumpTimer = this.jumpTimerStart;
    this.speed = speed;
    this.airSpeed = airSpeed;
    this.moveBool = true;

    // Input
    this.Input = {
      AXIS_X : 0,
      AXIS_Y : 0,
      JUMP : false,
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
    this.mesh.registerBeforeRender(() => {
        this.update();
    });
  }

  initAnimations () {
      //console.log('animation range', this.mesh.skeleton.getAnimationRange('run'));
      this.walkAnimation = this.mesh.skeleton.getAnimationRange('walk');
      this.runAnimation = this.mesh.skeleton.getAnimationRange('run');
      this.jumpAnimation = this.mesh.skeleton.getAnimationRange('jump');
      this.powerAnimation = this.mesh.skeleton.getAnimationRange('power');
      const animatable = this.game.scene.beginAnimation(this.mesh.skeleton, 0, 120, true, 2);
      setTimeout(() => {
          animatable.speedRatio /= 8;
      }, 4000);

      this.currentAnimation = null;
      this.currentAnimatable = null;
      /**
      this.walk = new BABYLON.Animation(game.scene.meshes[2])
      this.run = **/
  }

  startAnimationNew(animation) {
      if (this.currentAnimation != animation) {
          this.startAnimation(animation);
      }
  }

  startAnimation (animation) {
      this.currentAnimation = animation;
      this.currentAnimatable = this.game.scene.beginAnimation(this.mesh.skeleton, animation.from+1, animation.to, true, 1);
      this.currentAnimatable.enableBlending(.1);
  }

  animations () {
      // walk animation
      var magnitude = this.body.velocity.length();
      if (magnitude < 5) {
          this.startAnimationNew(this.walkAnimation);
          this.currentAnimatable.speedRatio = magnitude/2;
      } else if (magnitude > 5) {
          this.startAnimationNew(this.runAnimation);
          this.currentAnimatable.speedRatio = magnitude/50;
      }
  }

  initCapsule (width, height) {
    // Merges three spheres to create a capsule
    var m0 = BABYLON.Mesh.CreateSphere("m0", width, width, this.game.scene);
    var m1 = BABYLON.MeshBuilder.CreateCylinder("m1", {height: height, diameter: width, tessellation: 20},this.game.scene);
    var m2 = BABYLON.Mesh.CreateSphere("m2", width, width, this.game.scene);
    m0.position.y -= height * 0.5;
    m2.position.y += height * 0.5;
    m0.computeWorldMatrix(true);
	  m1.computeWorldMatrix(true);
	  m2.computeWorldMatrix(true);
    return BABYLON.Mesh.MergeMeshes([m0,m1,m2], true);
  }

  updateMassProperties() {
    this.body.linearDamping = .8;
    this.body.fixedRotation = true;
    this.body.sleepSpeedLimit = 20;
    this.body.updateMassProperties();
  }

  initGroundCheck() {
    // Create mesh for onGround collision check
    this.groundCheck = BABYLON.Mesh.CreateBox("mask", 2.5, this.game.scene);
    this.groundCheck.isVisible = false;
    this.groundCheck.parent = this.mask;
    this.groundCheck.position.y = -3;
    this.groundCheck.scaling.y = 0.2;
  }

  checkGroundCheck() {
    //TODO: http://schteppe.github.io/cannon.js/examples/threejs_voxel_fps.html use this jump check logic
    // Check for ground
    var jumpableMeshes = this.game.scene.getMeshesByTags("checkJump")
    this.onGround = false;
    for (var i in jumpableMeshes) {
      if (this.groundCheck.intersectsMesh(jumpableMeshes[i], true)){
        this.mesh.material.diffuseColor = new BABYLON.Color3.Red();
        this.onGround = true;
      }
    }
  }

  update () {
    this.checkGroundCheck();


    if (this.moveBool) {
        this.move();
    }

    this.animations();

    this._manageMana();
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
    if (this.onGround) {
        movementVector = normalizedMovementVector.scale(this.getScaleSpeed(movementVector, this.speed));
    } else {
        movementVector = normalizedMovementVector.scale(this.getScaleSpeed(movementVector, this.airSpeed));
    }

    // Jump
    if (this.onGround && this.Input.JUMP && this.jumpTimer == 0) {
        //console.log("jump!");
        movementVector = movementVector.add(new BABYLON.Vector3(0,this.jumpStrength,0));
        this.mesh.material.diffuseColor = BABYLON.Color3.Blue();
        this.jumpTimer = this.jumpTimerStart;
    }else if (this.jumpTimer > 0) {
      this.jumpTimer -= 1;
    }
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
        case Buttons.RB: this.Input.JUMP = pressed; break;
    }
  }

  handleButtonDown(button) {
    this._handleButton(button, true);
    switch (button) {
        case Buttons.A: this.attack1.buttonDown(0); break;
        case Buttons.B: this.attack2.buttonDown(0); break;
        case Buttons.X: this.attack3.buttonDown(0); break;
        case Buttons.Y: this.attack4.buttonDown(0); break;
    }
  }

  handleButtonUp(button) {
    this._handleButton(button, false);
    switch (button) {
        case Buttons.A: this.attack1.buttonUp(0); break;
        case Buttons.B: this.attack2.buttonUp(0); break;
        case Buttons.X: this.attack3.buttonUp(0); break;
        case Buttons.Y: this.attack4.buttonUp(0); break;
    }
  }

    _manageMana() {
        if (this._mana < maxMana) {
            this._mana = Math.min(maxMana, this._mana + 1);
        }
    }

    /**
     * Returns false if there is insufficient mana.
     */
    consumeMana(amount) {
        if (this._mana < amount) {
            return false;
        }
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
