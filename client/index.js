'use strict';

import React from 'react';
import {render} from 'react-dom';
import BABYLON from 'babylonjs';
import {BabylonJS} from './react-babylonjs.js';
import {Hero} from './game/heroes/baseHero';
import Menu from './menu/Menu';

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      menu: false,
    };
  }

  doRenderLoop() {
    this.scene.render();
  }

  handleEngineCreated(engine) {
    engine.getRenderingCanvas().focus();
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(engine);

    this.scene.actionManager = new BABYLON.ActionManager(this.scene);
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {
      switch (e.sourceEvent.key) {
      case 'Escape':
        this.setState({
          menu: true,
        });
        break;
      }
    }));
    this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, e => {
      switch (e.sourceEvent.key) {
      };
    }));

    //controllable camera
    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3.Zero(), this.scene);
    camera.setPosition(new BABYLON.Vector3(0, 15, -30));
    camera.attachControl(engine.getRenderingCanvas(), false);

    const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this.scene);

    /** SKYBOX **/
    BABYLON.Engine.ShadersRepository = "./shaders/";

    var skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, this.scene);

    const shader = new BABYLON.ShaderMaterial("gradient", this.scene, "gradient", {});
    shader.setFloat("offset", 0);
    shader.setFloat("exponent", 0.6);
    shader.setColor3("topColor", BABYLON.Color3.FromInts(0,119,255));
    shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240,240, 255));
    shader.backFaceCulling = false;
    skybox.material = shader;

    this.scene.enablePhysics(
      new BABYLON.Vector3(0, -200, 0),
      new BABYLON.OimoJSPlugin());

    var g = BABYLON.Mesh.CreateBox("ground", 400, this.scene);
    g.position.y = -20;
    g.scaling.y = 0.01;
    g.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move:false});

    for (var x in [0,1]) {
      require('../models/omi.blend').Append(BABYLON.SceneLoader, this.scene, loadedScene => {
        /*onsuccess*/
      //  new BABYLON.PhysicsImpostor(loadedScene.meshes[x], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, }, scene);
        loadedScene.beginAnimation(this.scene.skeletons[x], 0, 60, true, 2);
      }, x => {/*onprogress*/}, ex => {/*onerror*/});
    }

    //add a Player
    var hero = new Hero(this, 0);
  }

  handleEngineAbandoned(engine) {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }

  render() {
    // Hack to ensure canvas is focused.
    if (!this.state.menu && this.engine) {
      this.engine.getRenderingCanvas().focus();
    }

    return <div style={{width: '100%', height: '100%',}}>
        <BabylonJS onEngineCreated={engine => this.handleEngineCreated(engine)} onEngineAbandoned={engine => this.handleEngineAbandoned(engine)}/>
        {this.state.menu ? <Menu onHide={() => this.setState({menu: false,})}/> : []}
      </div>;
  }
}

render(<Game/>, document.getElementById("game-container"));
