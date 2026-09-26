# Circuit Runner

A self-contained browser arcade game you can open and edit in VS Code. It takes the tile-based maze idea from the linked Pacman tutorial and makes a new game with an original grid, glowing shard visuals, a chargeable pulse, and sentinels that move in a random open direction.

## Play

Open this folder in VS Code and open `index.html` in a browser, or use the VS Code Live Server extension. No build step or dependencies are required.

- Move: arrow keys or WASD
- Pulse: Space when the meter is full
- Pause: P
- Collect every shard, then reach the cyan exit.

All game visuals are drawn in Canvas by `game.js`; there are no copied image assets. Sentinel movement uses a small beginner-friendly random choice from the nearby open tiles. The project has no AI service, API, or model dependency. The external font falls back to system sans-serif if offline.
