import BABYLON from 'babylonjs';


export default class MapLoader {
  constructor (mapName='test1', game) {
    this.game = game;
    require(`../models/maps/${mapName}.blend`).ImportMesh(BABYLON.SceneLoader, null,          this.game.scene, loadedMeshes => {
    try {
      this.setImpostors('boxImpostor', BABYLON.PhysicsImpostor.BoxImpostor);
      this.setImpostors('heightFieldImpostor', BABYLON.PhysicsImpostor.HeightmapImpostor);
      this.setImpostors('sphereImpostor', BABYLON.PhysicsImpostor.SphereImpostor);
      this.setImpostors('cylinderImpostor', BABYLON.PhysicsImpostor.CylinderImpostor);
    } catch (e) {
      console.error(e);
    }
  });
}

  setImpostors (tag, impostorType, castShadow=true) {
    this.game.scene.getMeshesByTags(tag).forEach(function(mesh) {
        mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, impostorType, {move: false});
        // Collision groups
        mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.scene.collisionGroupGround;
        mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.scene.collisionGroupNormal | this.game.scene.collisionGroupGround;
        // Shadows
        if (castShadow) {
          this.game.scene.shadowGenerator.getShadowMap().renderList.push(mesh);
        }
        mesh.receiveShadows = true;
        mesh.convertToFlatShadedMesh();
      }, this);
    }
  }
