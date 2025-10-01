import { HttpClient } from "tsrpc-browser";
import { serviceProto, ServiceType } from "./shared/protocols/serviceProto_matchServer";

export function getMatchClient(): HttpClient<ServiceType> {
	return new HttpClient(serviceProto, {
		server: "http://127.0.0.1:3000", // MatchServer 端口 (HTTP)
		// Remove this to use binary mode (remove from the server too)
		json: true,
		logger: console,
	});
}
