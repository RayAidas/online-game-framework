import { enableAuthentication } from "./models/enableAuthentication";
import { parseCurrentUser } from "./models/parseCurrentUser";
import { UserServer } from "./User/UserServer";

export const userServer = new UserServer({
	port: 3003,
});

parseCurrentUser(userServer.server);
enableAuthentication(userServer.server);

// Entry function
async function main() {
	await userServer.init();
	await userServer.start();
}

main().catch((e) => {
	// Exit if any error during the startup
	userServer.server.logger.error(e);
	process.exit(-1);
});
