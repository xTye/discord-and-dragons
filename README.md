# discrord-and-dragons
A fun game designed to play with friends in a discord server. Make an .env file with your discord bot and run with `npm start`

# TODO
## Application
Immediate:
- Safegaurd button clicks by adding id reference to HUD and add in addActionRow
- Come up with a way to save hud states..
  Maybe MapHUD is its own class and a player holds an array of huds with wrapper class that manages all huds?
- Slowly add the command string array to replace the current .toString() reads..

Short Term:
- Interaction loading messages for players
- Power up classes
- Modular hud updates
- Test role mentions with commands wjen priviladged

Long Term:
- Communicate with database and website
- Migrate bot commands to backend server
- Add custom map creation

## Website (NOT STARTED but theory of abstraction)
- Login / Credentials
- Webhooks