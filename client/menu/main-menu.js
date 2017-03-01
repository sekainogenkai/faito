import {Menu, MenuPage, ButtonMenuItem} from './menu';
import CharacterSelectMenuPage from './character-select';
import React from 'react';

export default function (props) {
  return (
    <MenuPage {...props}>
      <ButtonMenuItem action={menu => menu.pushMenuPage(
        <CharacterSelectMenuPage players={props.players}/>
      )}>Play Game</ButtonMenuItem>
      <ButtonMenuItem action={menu => menu.pushMenuPage(
          <MenuPage>
              <ButtonMenuItem action={menu => menu.popMenuPage()}>Return</ButtonMenuItem>
              </MenuPage>)}>Quit to DOS</ButtonMenuItem>
    </MenuPage>
  );
}