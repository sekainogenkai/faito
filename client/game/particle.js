import BABYLON from 'babylonjs';

export default class ParticleEmitter {
  constructor (game, name, particle,
              position = new BABYLON.Vector3(0, 0, 0),
              direction1 = new BABYLON.Vector3(-10, 0, 10),
              direction2 = new BABYLON.Vector3(10, 0, -10),
              gravity = new BABYLON.Vector3(0,15,0),
              color1 = new BABYLON.Color3(0, 1, 0),
              color2 = new BABYLON.Color3(1, 1, 1)) {
    // Set up particle system
    this.game = game;
    this.particleSystem = new BABYLON.ParticleSystem(name, 10, this.game.scene);
    // Set the particle texture
    this.particleSystem.particleTexture = new BABYLON.Texture(particle, this.game.scene);
    // Set position
    this.particleSystem.emitter = position;
    // Set color
    this.particleSystem.color1 = color1;
    this.particleSystem.color2 = color2;

    // Changeable properties
    this.particleSystem.minLifeTime = 0.2;
    this.particleSystem.maxLifeTime = 0.5;

    this.particleSystem.minSize = 1;
    this.particleSystem.maxSize = 2;

    this.particleSystem.emitRate = 1;
    this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    this.particleSystem.direction1 = direction1;
    this.particleSystem.direction2 = direction2;


    this.particleSystem.gravity = gravity;
  }

  emitDuration (duration, emitRate, position) {
    this.particleSystem.emitter = position;
    this.particleSystem.targetStopDuration = duration;
    this.particleSystem.emitRate = emitRate;
    this.particleSystem.start();
  }

  emitManual (emitAmount, position) {
    this.particleSystem.emitter = position;
    this.particleSystem.manualEmitCount = emitAmount;
    this.particleSystem.start();
  }

  emitConstant (emitRate, position) {
    this.particleSystem.emitter = position;
    this.particleSystem.emitRate = emitRate;
    this.particleSystem.start();
  }

  updatePosition(position) {
    this.particleSystem.emitter = position;
  }

  stop () {
    this.particleSystem.stop();
  }
}
