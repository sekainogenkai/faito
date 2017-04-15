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
import {heroKeys, heroesContext} from './menu/character-select';
import {DummyInputTarget} from './player';

console.log('mapList', mapList);


class Game extends EventEmitter {
  constructor() {
      super();
      this.inputAddedSignal = new MiniSignal();
      this.players = new PlayerManager(this);
      this.players.changedSignal.add(() => this.handlePlayersChanged());
      this.heroesByPlayer = [];
      this.menuSignal = new MiniSignal();
      this.players.menuSignal.add(() => this.menuSignal.dispatch());
      // Initial state is for menu to be hidden. This preinitializes
      // the input targets.
      this.playerInfos = {};
      this.handleMenuHidden();
  }

  get heroes() {
    return this.heroesByPlayer.filter(hero => hero);
  }

    addInput(input) {
        this.inputAddedSignal.dispatch(input);
    }

    doRenderLoop() {
      this.scene.render();
    }

    handleMenuHidden() {
        this.players.setInputTargetFinder((i, player) => {
          const playerInfo = this.playerInfos[i];
          if (playerInfo) {
             return this.heroesByPlayer[i] ||
             (this.heroesByPlayer[i] = new (heroesContext(heroKeys[playerInfo.characterIndex]).default)(this, player.name, i));
          }
          return new DummyInputTarget();
        });
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
                    hero.destroy();
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
    this.loadRandomMenuScene();

    new InputManager(this);
  }

  loadRandomMenuScene() {
    // choose random map.
    const randMapIn = Math.floor(Math.random()*mapList.length);
    this.loadMenuScene(randMapIn);
  }

  loadMenuScene (i) {
    loadMenuScene(this, mapList[i]);
  }

  loadGameScene (i, playerInfo) {
    this.heroesByPlayer = [];
    this.playerInfos = playerInfo;

    loadGameScene(this, this.players, mapList[i]);
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
             <MainMenu players={this.props.game.players}  game={this.props.game}/>
           </Menu>: []}
      </div>;
  }
}

render(<Ui game={new Game()}/>, document.getElementById("game-container"));
