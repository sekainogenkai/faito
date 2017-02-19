import {Menu, MenuPage, ButtonMenuItem, LabelMenuItem} from './menu';
import StageSelectMenuPage from './stage-selection';
import React from 'react';

export default function CharacterSelectMenuPage(props) {
  props = Object.assign({
    playerIndex: 0,
  }, props);
  if (!props.players) throw new Error('Must pass players.');
  // Base case: no players left to choose for.
  if (props.playerIndex >= props.players.players.length) {
    return <StageSelectMenuPage {...props} players={props.players}/>;
  }
  // Is the current player defined? Otherwise recurse.
  const player = props.players.players[props.playerIndex];
  if (!player) {
    return <CharacterSelectMenuPage {...props} players={players} playerIndex={props.playerIndex + 1}/>;
  }
  // We have an actual current player to make a decision about! Yay~!
  return (
    <MenuPage {...props}>
      <LabelMenuItem>
        {player.name} Character Selection
      </LabelMenuItem>
      <ButtonMenuItem action={menu => menu.pushMenuPage(
        <CharacterSelectMenuPage players={props.players} playerIndex={props.playerIndex + 1}/>
      )}>Hero 1</ButtonMenuItem>
      <ButtonMenuItem action={menu => menu.pushMenuPage(
        <CharacterSelectMenuPage players={props.players} playerIndex={props.playerIndex + 1}/>
      )}>Hero 2</ButtonMenuItem>
      <ButtonMenuItem action={menu => menu.popMenuPage()}>Back</ButtonMenuItem>
    </MenuPage>
  );
}
