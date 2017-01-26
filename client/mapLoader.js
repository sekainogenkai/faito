import BABYLON from 'babylonjs';


export default class MapLoader {
    constructor (mapName='test1', game) {
        this.game = game;
        require(`../models/maps/${mapName}.blend`).ImportMesh(BABYLON.SceneLoader, null,          this.game.scene, loadedMeshes => {
             this.setImpostors('boxImpostor', BABYLON.PhysicsImpostor.BoxImpostor);
             this.setImpostors('heightFieldImpostor', BABYLON.PhysicsImpostor.HeightmapImpostor);
        });
    }
    
    setImpostors (tag, impostorType) {
        this.game.scene.getMeshesByTags(tag).forEach(function(mesh) {
            mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, impostorType, {move: false});
            // Collision groups
            mesh.physicsImpostor.physicsBody.collisionFilterGroup = this.game.collisionGroupGround;
            mesh.physicsImpostor.physicsBody.collisionFilterMask = this.game.collisionGroupNormal | this.game.collisionGroupGround;
            // Shadows
            this.game.shadowGenerator.getShadowMap().renderList.push(mesh);
            mesh.receiveShadows = true;
        }, this);
    }
}