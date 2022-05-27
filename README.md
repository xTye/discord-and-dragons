# discrord-and-dragons
A fun game designed to play with friends in a discord server. Make an .env file with your discord bot and run with `npm start`

# TODO
## Application
Immediate:


Short Term:
- Create hud errors
- Create leave game page (only viewable for players)
- Add player commands for syncing states and loading ui
- Add the command string array to replace the current .toString() reads
- Interaction loading messages for players
- Power up classes
- Modular hud updates
- Test role mentions with commands wjen priviladged

Long Term:
- Able to rejoin game if connection lost, kills player at the end of round iff their voice state can't be changed
- Update mapHUD on game state change events
- Add delegates to listen for events and make HUD render with no interactions
- Communicate with database and website
- Migrate bot commands to backend server
- Add custom map creation

## Website (NOT STARTED but theory of abstraction)
- Login / Credentials
- Webhooks