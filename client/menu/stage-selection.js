import {Buttons} from '../game/input';
import {ButtonMenuItem, LabelMenuItem, MenuPage} from './menu';
import React from 'react';
import {DummyInputTarget} from '../player';
import mapList from './mapList';

class StageSelectInputHandler extends DummyInputTarget{
  constructor(stageSelectMenuPage) {
    super();
    this.stageSelectMenuPage = stageSelectMenuPage;
  }

  buttonDown(button) {
    switch (button) {
      case Buttons.JoyLeft:
        this.stageSelectMenuPage.menuChange(-1);
        break;
      case Buttons.JoyRight:
        this.stageSelectMenuPage.menuChange(1);
        break;
      case Buttons.A:
        this.stageSelectMenuPage.selectMap();
        break;
      case Buttons.B:
        this.stageSelectMenuPage.back();
        break;
    }
  }
}

export default class StageSelectMenuPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMap: 0,
    };
    this.loadMenuScene();
  }

  menuChange(i) {
    let newSelectedMap = (this.state.selectedMap + i) % mapList.length;
    if (newSelectedMap < 0) {
      newSelectedMap = mapList.length - 1;
    }
    this.setState({
      selectedMap: newSelectedMap,
    });
    this.loadMenuScene();
  }

  loadMenuScene() {
    console.log('kristofer pay attention to this');
    console.log('da game2', this.props.game.loadMenuScene);
    console.log('new map', mapList[this.state.selectedMap]);
    this.props.game.loadMenuScene(this.state.selectedMap);
  }

  selectMap() {
    this.props.game.loadGameScene(this.state.selectedMap, this.props.playerInfo);

    this.props.menu.clearMenu();
  }

  back() {
    this.props.menu.popMenuPage();
  }

  componentDidMount() {
    const inputHandler = new StageSelectInputHandler(this);
    this.props.players.setInputTargetFinder((i, player) => inputHandler);
  }

  render() {
    return <div className="menu-page" style={{backgroundColor: 'white'}}>
    <p>{mapList[this.state.selectedMap]}</p>
    </div>;
  }
}
