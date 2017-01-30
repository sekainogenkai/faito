import BABYLON from 'babylonjs';

export default class Particle {
  constructor (game, particle, position) {
    // Set up particle system
    this.game = game;
    this.particleSystem = new BABYLON.ParticleSystem("particles", 100, this.game.scene);
    // Set the particle texture
    this.particleSystem.particleTexture = new BABYLON.Texture(particle, this.game.scene);
    this.particleSystem.textureMask = new BABYLON.Color4(0.1, 0.8, 0.8, 1.0);
    // Set position
    this.particleSystem.emitter = position;

    // Changeable properties
    this.particleSystem.minLifeTime = 0.5;
    this.particleSystem.maxLifeTime = 2.5;
      
    this.particleSystem.minSize = 0.1;
    this.particleSystem.maxSize = 0.5;
      
    this.particleSystem.manualEmitCount = 100;
    this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
      
    this.particleSystem.direction1 = new BABYLON.Vector3(-7, 8, 3);
    this.particleSystem.direction2 = new BABYLON.Vector3(7, 8, -3);
     
      
    this.particleSystem.gravity = new BABYLON.Vector3(0,-10,0);

    // Set life of the system
    this.particleSystem.disposeOnStop = true;
    this.particleSystem.targetStopDuration = 5;
      
    this.particleSystem.disposeOnStop = true;
      
    this.particleSystem.start();
  }
}
