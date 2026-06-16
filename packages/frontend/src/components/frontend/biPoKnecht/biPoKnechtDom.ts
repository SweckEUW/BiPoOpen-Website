// All DOM / animation side-effects for the BiPoKnecht board live here.
// The game logic in useBiPoKnecht.ts stays completely free of DOM access and
// only talks to the screen through this `effects` object.
//
// The board renders two racks with stable element ids:
//   ra-cup-team-<team>-<cup>      one of the 10 cups (cup 0..9)
//   ra-ball-team-<team>-<ball>    one of the 2 balls (ball = player index)
//   ra-null-team-<team>           the "Nullwurf" drop area
//   ra-airball-team-<team>        the "Airball" drop area
// The active team always throws at the ENEMY rack, so every helper takes the
// active team index and targets `enemyOf(active)`.

export type Effects = ReturnType<typeof createEffects>;

export const createEffects = () => {

  const enemyOf = (activeTeamIndex: number) => (activeTeamIndex === 0 ? 1 : 0);

  const getBall = (teamIndex: number, ballIndex: number) =>
    document.getElementById(`ra-ball-team-${teamIndex}-${ballIndex}`)!;

  const getCup = (teamIndex: number, cupIndex: number) =>
    document.getElementById(`ra-cup-team-${teamIndex}-${cupIndex}`)!;

  // Make the throwing ball visible.
  const ballStart = (activeTeamIndex: number, playerIndex: number) => {
    getBall(enemyOf(activeTeamIndex), playerIndex).style.opacity = '1';
  };

  // Fly the ball onto a hit cup.
  const ballToCup = (activeTeamIndex: number, playerIndex: number, cupIndex: number) => {
    const enemy = enemyOf(activeTeamIndex);
    const ball = getBall(enemy, playerIndex);
    const cup = getCup(enemy, cupIndex);
    ball.style.top = `${cup.offsetTop + 25}px`;
    ball.style.left = `${cup.offsetLeft + 25}px`;
  };

  // Fly the ball into the Nullwurf / Airball area.
  const ballToArea = (activeTeamIndex: number, playerIndex: number, area: 'null' | 'airball') => {
    const enemy = enemyOf(activeTeamIndex);
    const ball = getBall(enemy, playerIndex);
    const areaEl = document.getElementById(`ra-${area}-team-${enemy}`)!;
    // The two racks are rotated 180° against each other, so the active team
    // drops the ball from the top or the bottom depending on which side it is.
    if (activeTeamIndex === 1)
      ball.style.top = `${areaEl.offsetTop}px`;
    else
      ball.style.bottom = `${areaEl.getBoundingClientRect().top}px`;
    ball.style.left = `calc(50% - 15px)`;
  };

  // Hide both balls of the enemy rack and reset their position.
  const hideBalls = (activeTeamIndex: number) => {
    const enemy = enemyOf(activeTeamIndex);
    for (let i = 0; i < 2; i++) {
      const ball = getBall(enemy, i);
      ball.style.opacity = '0';
      ball.style.top = 'auto';
      ball.style.bottom = 'auto';
      ball.style.left = 'auto';
      ball.style.right = 'auto';
    }
  };

  // Let the user click one more enemy cup (used by bouncer & bomb).
  // Resolves with the clicked cup index. The capture-phase listener stops the
  // click from also counting as a normal hit.
  const askCup = (activeTeamIndex: number) => new Promise<number>((resolve) => {
    const enemy = enemyOf(activeTeamIndex);
    const cups = Array.from({ length: 10 }, (_, i) => getCup(enemy, i));
    const handlers: ((e: MouseEvent) => void)[] = [];

    const onClick = (cupIndex: number, e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      cups.forEach((cup, i) => cup.removeEventListener('click', handlers[i], true));
      resolve(cupIndex);
    };

    cups.forEach((cup, i) => {
      const listener = (e: MouseEvent) => onClick(i, e);
      handlers[i] = listener;
      cup.addEventListener('click', listener, true);
    });
  });

  const enterFullscreen = () => {
    if (process.env.NODE_ENV !== 'development')
      document.documentElement.requestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement)
      document.exitFullscreen();
  };

  return { ballStart, ballToCup, ballToArea, hideBalls, askCup, enterFullscreen, exitFullscreen };
};
