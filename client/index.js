import EventEmitter from 'events';
import {Buttons, Manager as InputManager} from './game/input';
import MiniSignal from 'mini-signals';
import {PlayerManager} from './player';
import React from 'react';
import {render} from 'react-dom';
import BABYLON from 'babylonjs';
import {BabylonJS} from './react-babylonjs.js';
import {default as Menu, MenuPage, ButtonMenuItem, LabelMenuItem} from './menu/menu';
import loadGameScene from './game/gameScene';
import loadMenuScene from './game/menuScene';
import MainMenu from './menu/main-menu';
import MapLoader from './mapLoader';
import mapList from './menu/mapList';

console.log('mapList', mapList);



import Hero1 from './game/heroes/psych';
import Hero2 from './game/heroes/skater';
import Hero3 from './game/heroes/skater';

class Game extends EventEmitter {
  constructor() {
      super();
      this.inputAddedSignal = new MiniSignal();
      this.players = new PlayerManager(this);
      this.players.changedSignal.add(() => this.handlePlayersChanged());
      this.heroes = [];
      this.menuSignal = new MiniSignal();
      this.players.menuSignal.add(() => this.menuSignal.dispatch());
      // Initial state is for menu to be hidden. This preinitializes
      // the input targets.
      this.handleMenuHidden();
  }

    addInput(input) {
        this.inputAddedSignal.dispatch(input);
    }

  doRenderLoop() {
    this.scene.render();
  }

    handleMenuHidden() {
        this.players.setInputTargetFinder((i, player) => this.heroes[i] ||
        (this.heroes[i] =
          (i==0)?new Hero1(this, player.name, i): (i==1) ? new Hero2(this, player.name, i) : new Hero3(this, player.name, i)
        ));
    }

    handlePlayersChanged() {
        // For now, create a hero now. In the future, hero creation will
        // be up to the current game mode (no such thing exists yet
        // though).
        for (const i in this.players) {
            const player = this.players[i];
            if (!player) {
                // Clean up hero.
                const hero = this.heroes[i];
                if (hero) {
                    hero.destory();
                    this.heroes[i] = undefined;
                }
            }
        }
    }

  setEngine(engine) {
    this.engine = engine;
    engine.runRenderLoop(this.handleRenderLoop = () => this.doRenderLoop());
    this.scene = new BABYLON.Scene(this.engine);
    // Set path to shaders
    BABYLON.Engine.ShadersRepository = "./shaders/";


    // Load the game
    this.loadMenu();

    new InputManager(this);
  }

  loadMenu () {
    // choose random map.
    const randMapIn = Math.floor(Math.random()*mapList.length);
    loadMenuScene(this, mapList[randMapIn]);
  }

  loadGame () {
    loadGameScene(this);
  }

  abandonEngine(engine) {
    this.engine.stopRenderLoop(this.handleRenderLoop);
    this.handleRenderLoop = null;
    this.engine = null;
  }
}

class Ui extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: true,
    };
  }

    handleEngineCreated(engine) {
        this.props.game.setEngine(engine);
        this.props.game.menuSignal.add(() => {
            this.setState({
                menu: !this.state.menu,
            });
            if (!this.state.menu) {
                this.handleMenuHidden();
            }
        });
    }

  handleEngineAbandoned(engine) {
    this.props.game.abandonEngine(engine);
  }

  handleMenuHidden() {
      this.setState({menu: false,});
      this.props.game.handleMenuHidden();
  }

  render() {
    return <div style={{width: '100%', height: '100%',}}>
        <BabylonJS onEngineCreated={engine => this.handleEngineCreated(engine)} onEngineAbandoned={engine => this.handleEngineAbandoned(engine)}/>
          {this.state.menu ? <Menu players={this.props.game.players} onHide={() => this.handleMenuHidden()}>
             <MainMenu players={this.props.game.players}/>
           </Menu>: []}
      </div>;
  }
}

render(<Ui game={new Game()}/>, document.getElementById("game-container"));
