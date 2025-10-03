import { ServiceProto } from "tsrpc-proto";
import { ReqLogin, ResLogin } from "./userServer/PtlLogin";
import { ReqLogout, ResLogout } from "./userServer/PtlLogout";

export interface ServiceType {
	api: {
		Login: {
			req: ReqLogin;
			res: ResLogin;
		};
		Logout: {
			req: ReqLogout;
			res: ResLogout;
		};
	};
	msg: {};
}

export const serviceProto: ServiceProto<ServiceType> = {
	version: 5,
	services: [
		{
			id: 3,
			name: "Login",
			type: "api",
			conf: {},
		},
		{
			id: 4,
			name: "Logout",
			type: "api",
			conf: {},
		},
	],
	types: {
		"PtlLogin/ReqLogin": {
			type: "Interface",
			extends: [
				{
					id: 0,
					type: {
						type: "Reference",
						target: "base/BaseRequest",
					},
				},
			],
			properties: [
				{
					id: 0,
					name: "username",
					type: {
						type: "String",
					},
				},
				{
					id: 1,
					name: "password",
					type: {
						type: "String",
					},
				},
			],
		},
		"base/BaseRequest": {
			type: "Interface",
			properties: [
				{
					id: 0,
					name: "__ssoToken",
					type: {
						type: "String",
					},
					optional: true,
				},
			],
		},
		"PtlLogin/ResLogin": {
			type: "Interface",
			extends: [
				{
					id: 0,
					type: {
						type: "Reference",
						target: "base/BaseResponse",
					},
				},
			],
			properties: [
				{
					id: 0,
					name: "__ssoToken",
					type: {
						type: "String",
					},
				},
				{
					id: 1,
					name: "user",
					type: {
						type: "Reference",
						target: "../models/CurrentUser/CurrentUser",
					},
				},
			],
		},
		"base/BaseResponse": {
			type: "Interface",
			properties: [
				{
					id: 0,
					name: "__ssoToken",
					type: {
						type: "String",
					},
					optional: true,
				},
			],
		},
		"../models/CurrentUser/CurrentUser": {
			type: "Interface",
			properties: [
				{
					id: 0,
					name: "uid",
					type: {
						type: "Number",
					},
				},
				{
					id: 1,
					name: "username",
					type: {
						type: "String",
					},
				},
				{
					id: 2,
					name: "roles",
					type: {
						type: "Array",
						elementType: {
							type: "String",
						},
					},
				},
			],
		},
		"PtlLogout/ReqLogout": {
			type: "Interface",
			extends: [
				{
					id: 0,
					type: {
						type: "Reference",
						target: "base/BaseRequest",
					},
				},
			],
		},
		"PtlLogout/ResLogout": {
			type: "Interface",
			extends: [
				{
					id: 0,
					type: {
						type: "Reference",
						target: "base/BaseResponse",
					},
				},
			],
		},
	},
};
