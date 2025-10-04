import { ApiCall } from "tsrpc";
import { AuthService } from "../../services/AuthService";
import { ReqLogout, ResLogout } from "../../shared/protocols/userServer/PtlLogout";

export async function ApiLogout(call: ApiCall<ReqLogout, ResLogout>) {
	if (call.req.__ssoToken) {
		const result = await AuthService.logout(call.req.__ssoToken);

		if (!result.success) {
			console.error("登出失败:", result.error);
		}
	}

	call.succ({
		__ssoToken: "",
	});
}
