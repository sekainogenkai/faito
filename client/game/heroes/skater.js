import BaseHero from './baseHero'

import SkaterPowerHandler from './powers/heroPowers/skater/aHandler';

export default class Skater extends BaseHero {
  constructor(game, name, id) {
    super(game, name, id, 'omi',
    {speed:9, airSpeed:9, jumpStrength:130, rollGroundSpeed:18, rollAirSpeed:10},
    SkaterPowerHandler);
  }

  // change animation for if the skater is a skating
  animations() {
    if (true) {
      super.animations();
    }
  }
}
