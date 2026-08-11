# Wild West Mini Games - Design Specification

## Overview
A web-based collection of 8 Wild West themed mini-games designed for a Halloween neighborhood hayride and party. The games will be displayed on a projector and controlled exclusively by up to 4 Playstation 2 USB Buzz Controllers. The system must be foolproof for kids and teens, and run via a Windows laptop (potentially older hardware) in Kiosk mode.

## Architecture
- **Tech Stack:** Vanilla HTML, CSS, and JavaScript using the HTML5 Canvas API. No build tools are required, maximizing compatibility with older browsers and making on-the-fly edits easy.
- **File Structure:** 
  - `index.html` (Main entry point)
  - `css/style.css` (Theming, large fonts, projector-optimized contrast)
  - `js/main.js` (State machine and game loop: `update()` and `draw()`)
  - `js/input.js` (Gamepad API wrapper for Buzz controllers)
  - `js/menu.js` (Game selection carousel)
  - `js/games/*.js` (Individual game logic, e.g., `quick_draw.js`)
- **State Management:** A simple global state tracker will manage the current active scene (`MENU`, `GAME_ACTIVE`, `SCOREBOARD`). 

## Input Handling
- **API:** HTML5 Gamepad API.
- **Controllers:** Up to 4 Buzz Controllers.
- **Mapping:** `input.js` will include a hidden keyboard-triggered calibration screen to map the specific Gamepad API indices of the Buzz controllers to a standardized internal layout (Red Button, Blue, Orange, Green, Yellow).
- **Core Gameplay Input:** Almost all gameplay relies exclusively on the **Big Red Button**.

## UX & UI (Menu System)
- **Menu Flow:** A horizontal carousel displaying the 8 mini-games.
- **Navigation:**
  - **Blue Button (Top):** Scroll carousel Left.
  - **Yellow Button (Bottom):** Scroll carousel Right.
  - **Big Red Button:** Start the selected game.
- **Aesthetics:** Wild West themed (wood grain, wanted posters, western fonts like "Playbill" or "Rye").
- **Accessibility:** Massive text, highly contrasted elements for easy projector viewing.
- **Loop:** Game -> 60s max -> 10s Scoreboard -> Auto-return to Menu.

## Mini-Games (8 Total)
Each game lasts 30-60 seconds max.

1. **Quick Draw:** Tension builds... "DRAW!" appears. First to hit their Red Button wins. (Reaction)
2. **Gold Rush:** Mash the Red Button as fast as possible to fill your minecart with gold before time runs out. (Stamina/Mashing)
3. **Lasso Catch:** A moving cow runs back and forth across a target zone. Hit the Red Button to throw the lasso when perfectly lined up. (Precision Timing)
4. **Bandit Whack:** Bandits pop up wearing specific player colors (Player 1, 2, 3, or 4's color). When a bandit matching your color pops up, hit your Red Button. (Recognition)
5. **Dynamite Toss:** Hold the Red Button to build power on a meter. Release when it hits the "sweet spot" to blow up a safe. (Hold & Release)
6. **Horse Race:** Press the Red Button to a rhythmic heartbeat pulse on screen. Hitting it on the beat makes your horse sprint; mashing it makes it stumble. (Rhythm)
7. **Snake Bite (Red Light, Green Light):** A rattlesnake shakes its tail (do NOT press). When it stops and strikes, press the Red Button! False starts eliminate you. (Inhibition)
8. **Telegraph Decoder:** Watch a sequence of short and long flashes. Repeat the sequence back using short taps or long holds on the Red Button to crack the safe. (Memory)
