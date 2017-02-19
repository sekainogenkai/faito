import {ButtonMenuItem, LabelMenuItem, MenuPage} from './menu';
import React from 'react';

export default function (props) {
  return <MenuPage {...props}>
  <LabelMenuItem>Stage Selection</LabelMenuItem>
  <ButtonMenuItem>Stage 1</ButtonMenuItem>
  <ButtonMenuItem>Stage 2</ButtonMenuItem>
  <ButtonMenuItem action={menu => menu.popMenuPage()}>Back</ButtonMenuItem>
  </MenuPage>;
};
