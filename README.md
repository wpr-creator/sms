# SMS MATH QUEST: FALCON FLIGHT SCHOOL

Static GitHub Pages site for 3rd grade math review.

## Files

- `index.html`: home base and locked mission map
- `mission.html`: separate mission play screen
- `styles.css`: visual design, animations, responsive layout
- `app.js`: game logic, question banks, progress saving, generated sounds

## How it works

Students start at Falcon Flight School, play one mission at a time, keep three lives during the mission, and unlock the next mission after passing. A completed mission launches the next mission instead of sending students back to the map.

Each mission asks 15 questions, but the game builds from a larger randomized bank so students should not see the same set every time. Progress saves in the browser with `localStorage`.

## GitHub Pages

Upload these files to the repo root and enable GitHub Pages from the main branch. No build step is required.

## Sound

The site uses small browser-generated sound effects through the Web Audio API. There are no audio files to host.
