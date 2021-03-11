All the options of the config.json:

 	"logs": Logging options.
		"log-chat-to-console": Prints the chat to the console.
		"log-chat-to-file": Save the chat in a file, chat.log. Erased on restart.
    
 	"server": Server options.
		"host": IP of the server.
		"port": Port of the server. Default is 25565.
    
	"afkbot": Options for the Bot.
		"username": A name for the Bot, if the server has online-mode set to true, it's the e-mail.
		"password": Password of the account, if the server has online-mode set to false, you can leave it blank.
		"auth-method": Method of authenticating. Default is "mojang", can be also "microsoft".
    
	"discord": Discord Bot options.
		"token": Token of the Discord Bot.
		"guild-id": ID of the server. WARNING: It's the ID of the DISCORD SERVER, to get this, you must have Developer Mode turned On.
		"channel-id": ID of the channel where the Bot will print the chat, or where it will listen for commands.
		"embed-hex-color": Hex color of the embeds that the Bot will send.
		"prefix": Prefix for the Bot Commands.
    
		"bot-rpc": Bot's Rich Presence options.
			"enable": Having this set to true, will enable the Rich Presence of the Bot.
			"text": Text to show in the Rich Presence.
      
		"send-chat-to-minecraft": Having this set to true, the Bot will read all non-commands messages and send it to Minecraft.
	
	"auto-login": Auto-Login features for plugins like AuthMe. Can only do /login for now. You have to /register it manually before-hand.
		"enable": Having this set to true, the bot will execute the /login [password] command on spawn Default is false.
		"password": Password for the /login [password] command.
    
	"whispers": How the Bot will handle whispers.
		"enable-answer": Having this set to false, will make the Bot ignore all whispers that are for him.
		"timeout-on-whisper": Time in milliseconds that will pass between receiving the whisper and sending a reply.
		"message-to-answer": Message to answer when someone whispers to the Bot.
    
	"pvp": PvP-PvE options.
		"enable": Having this set to false, will make the Bot ignore all approaching mobs.
		"attack-players": Having this set to false, will make the Bot ignore approaching players.
		"attack-endermans": Having this set to false, will make the Bot ignore approaching endermens.
    
	"auto-eat": Auto-Eat options. This plugin automatically toggles depending on if the Bot has food in his inventory or not.
		"enable": Having this set to false, will make the Bot not eat when he is hungry.
		"send-status": Having this set to true, will make the Bot send status updates of this plugin in the form of Discord Embeds.
		"priority": "saturation" or "foodPoints".
		"start-at": 1-20. Food level to start eating at.
		"banned-foods": Array of banned foods.
    
	"bloodhound": Bloodhound options.
		"enable": Having this set to false, the Bot won't find out who attacked it before killing it.
    
	"viewer": Viewer options.
		"enable": Having this set to false, the Bot won't create a Viewer.
		"first-person": If the viewer should be on first person.
		"view-distance": Same as render distance in chunks.
		"port": Number of a port. Can be left as default: 3000.
    
	"low-health": Low-Health options.
		"warn-on-low-health": Having this set to true, will make the Bot send a message if his health goes below "health-points".
		"health-points": Critical health level.
		"disconnect-on-low-health": Having this set to true, will make the Bot disconnect when his health goes below "health-points".
    
	"message-on-interval": Interval message options.
		"enable": Having this set to true, will make the Bot say a message every "interval" milliseconds.
		"inteval": Milliseconds between each message is sent.
		"message": Message to say.
    
	"windows-notifications": Windows Notification options.
		"on-banned": Having this set to true, will make the Bot send a Windows Notification when it's banned.
		"on-kicked": Having this set to true, will make the Bot send a Windows Notification when it's kicked.
		"on-death": Having this set to true, will make the Bot send a Windows Notification when it dies or it's killed.
		
	"pathfind": Pathfinding options.
		"pathfind-range": Number of blocks the Bot should stay away from the target when it's following him.
		"max-dropdown-blocks": Maximum height the bot can fall while pathfinding. Default is 4.
		
	"misc-options". Miscellaneous options.
		"send-chat-to-ds": Having this set to true, will make the Bot send the minecraft chat to Discord, not recommended as Discord doesn't like having a lot of messages sent in a short span of time.
		"antikick-jump": Having this set to true, will make the Bot jump every "antikick-jump-interval" milliseconds.
		"look-entities": Having this set to true, will make the Bot look at nearby players.
    
	"timeouts": Timeouts on various events. All of them have to be in milliseconds.
		"on-kicked": Milliseconds that will pass before the Bot will reconnect to the server if it's kicked.
		"antikick-jump-interval": Milliseconds that will pass between each "antikick-jump" jump.
    
	"debug": Having this set to true will make the Bot print some useless extra information in the console.
