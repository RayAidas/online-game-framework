import { ServiceProto } from 'tsrpc-proto';
import { ReqClearUserRoomState, ResClearUserRoomState } from './matchServer/PtlClearUserRoomState';
import { ReqCreateRoom, ResCreateRoom } from './matchServer/PtlCreateRoom';
import { ReqListRooms, ResListRooms } from './matchServer/PtlListRooms';
import { ReqRoomServerJoin, ResRoomServerJoin } from './matchServer/PtlRoomServerJoin';
import { ReqStartMatch, ResStartMatch } from './matchServer/PtlStartMatch';
import { MsgUpdateRoomState } from './roomServer/clientMsg/MsgUpdateRoomState';
import { MsgUserState } from './roomServer/clientMsg/MsgUserState';
import { ReqAuth, ResAuth } from './roomServer/PtlAuth';
import { ReqCreateRoom as ReqCreateRoom_1, ResCreateRoom as ResCreateRoom_1 } from './roomServer/PtlCreateRoom';
import { ReqExitRoom, ResExitRoom } from './roomServer/PtlExitRoom';
import { ReqJoinRoom, ResJoinRoom } from './roomServer/PtlJoinRoom';
import { ReqSendChat, ResSendChat } from './roomServer/PtlSendChat';
import { ReqSendInput, ResSendInput } from './roomServer/PtlSendInput';
import { ReqSetReady, ResSetReady } from './roomServer/PtlSetReady';
import { MsgChat } from './roomServer/serverMsg/MsgChat';
import { MsgGameStarted } from './roomServer/serverMsg/MsgGameStarted';
import { MsgOwnerChanged } from './roomServer/serverMsg/MsgOwnerChanged';
import { MsgSyncFrame } from './roomServer/serverMsg/MsgSyncFrame';
import { MsgUserExit } from './roomServer/serverMsg/MsgUserExit';
import { MsgUserJoin } from './roomServer/serverMsg/MsgUserJoin';
import { MsgUserReadyChanged } from './roomServer/serverMsg/MsgUserReadyChanged';
import { MsgUserStates } from './roomServer/serverMsg/MsgUserStates';
import { ReqLogin, ResLogin } from './userServer/PtlLogin';
import { ReqLogout, ResLogout } from './userServer/PtlLogout';
import { ReqRegister, ResRegister } from './userServer/PtlRegister';

export interface ServiceType {
    api: {
        "matchServer/ClearUserRoomState": {
            req: ReqClearUserRoomState,
            res: ResClearUserRoomState
        },
        "matchServer/CreateRoom": {
            req: ReqCreateRoom,
            res: ResCreateRoom
        },
        "matchServer/ListRooms": {
            req: ReqListRooms,
            res: ResListRooms
        },
        "matchServer/RoomServerJoin": {
            req: ReqRoomServerJoin,
            res: ResRoomServerJoin
        },
        "matchServer/StartMatch": {
            req: ReqStartMatch,
            res: ResStartMatch
        },
        "roomServer/Auth": {
            req: ReqAuth,
            res: ResAuth
        },
        "roomServer/CreateRoom": {
            req: ReqCreateRoom_1,
            res: ResCreateRoom_1
        },
        "roomServer/ExitRoom": {
            req: ReqExitRoom,
            res: ResExitRoom
        },
        "roomServer/JoinRoom": {
            req: ReqJoinRoom,
            res: ResJoinRoom
        },
        "roomServer/SendChat": {
            req: ReqSendChat,
            res: ResSendChat
        },
        "roomServer/SendInput": {
            req: ReqSendInput,
            res: ResSendInput
        },
        "roomServer/SetReady": {
            req: ReqSetReady,
            res: ResSetReady
        },
        "userServer/Login": {
            req: ReqLogin,
            res: ResLogin
        },
        "userServer/Logout": {
            req: ReqLogout,
            res: ResLogout
        },
        "userServer/Register": {
            req: ReqRegister,
            res: ResRegister
        }
    },
    msg: {
        "roomServer/clientMsg/UpdateRoomState": MsgUpdateRoomState,
        "roomServer/clientMsg/UserState": MsgUserState,
        "roomServer/serverMsg/Chat": MsgChat,
        "roomServer/serverMsg/GameStarted": MsgGameStarted,
        "roomServer/serverMsg/OwnerChanged": MsgOwnerChanged,
        "roomServer/serverMsg/SyncFrame": MsgSyncFrame,
        "roomServer/serverMsg/UserExit": MsgUserExit,
        "roomServer/serverMsg/UserJoin": MsgUserJoin,
        "roomServer/serverMsg/UserReadyChanged": MsgUserReadyChanged,
        "roomServer/serverMsg/UserStates": MsgUserStates
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 32,
    "services": [
        {
            "id": 31,
            "name": "matchServer/ClearUserRoomState",
            "type": "api"
        },
        {
            "id": 23,
            "name": "matchServer/CreateRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 24,
            "name": "matchServer/ListRooms",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 27,
            "name": "matchServer/RoomServerJoin",
            "type": "api",
            "conf": {}
        },
        {
            "id": 25,
            "name": "matchServer/StartMatch",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 28,
            "name": "roomServer/clientMsg/UpdateRoomState",
            "type": "msg",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 14,
            "name": "roomServer/clientMsg/UserState",
            "type": "msg"
        },
        {
            "id": 29,
            "name": "roomServer/Auth",
            "type": "api",
            "conf": {}
        },
        {
            "id": 30,
            "name": "roomServer/CreateRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 15,
            "name": "roomServer/ExitRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 16,
            "name": "roomServer/JoinRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 17,
            "name": "roomServer/SendChat",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 36,
            "name": "roomServer/SendInput",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 32,
            "name": "roomServer/SetReady",
            "type": "api"
        },
        {
            "id": 18,
            "name": "roomServer/serverMsg/Chat",
            "type": "msg"
        },
        {
            "id": 38,
            "name": "roomServer/serverMsg/GameStarted",
            "type": "msg"
        },
        {
            "id": 33,
            "name": "roomServer/serverMsg/OwnerChanged",
            "type": "msg"
        },
        {
            "id": 39,
            "name": "roomServer/serverMsg/SyncFrame",
            "type": "msg"
        },
        {
            "id": 19,
            "name": "roomServer/serverMsg/UserExit",
            "type": "msg"
        },
        {
            "id": 20,
            "name": "roomServer/serverMsg/UserJoin",
            "type": "msg"
        },
        {
            "id": 34,
            "name": "roomServer/serverMsg/UserReadyChanged",
            "type": "msg"
        },
        {
            "id": 21,
            "name": "roomServer/serverMsg/UserStates",
            "type": "msg"
        },
        {
            "id": 5,
            "name": "userServer/Login",
            "type": "api",
            "conf": {}
        },
        {
            "id": 6,
            "name": "userServer/Logout",
            "type": "api",
            "conf": {}
        },
        {
            "id": 26,
            "name": "userServer/Register",
            "type": "api",
            "conf": {}
        }
    ],
    "types": {
        "matchServer/PtlClearUserRoomState/ReqClearUserRoomState": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "userId",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "base/BaseRequest": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "__ssoToken",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "matchServer/PtlClearUserRoomState/ResClearUserRoomState": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "base/BaseResponse": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "__ssoToken",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "matchServer/PtlCreateRoom/ReqCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "matchServer/PtlCreateRoom/ResCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "serverUrl",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "matchServer/PtlListRooms/ReqListRooms": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "matchServer/PtlListRooms/ResListRooms": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "rooms",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Interface",
                            "properties": [
                                {
                                    "id": 0,
                                    "name": "name",
                                    "type": {
                                        "type": "String"
                                    }
                                },
                                {
                                    "id": 1,
                                    "name": "userNum",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                },
                                {
                                    "id": 2,
                                    "name": "maxUserNum",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                },
                                {
                                    "id": 3,
                                    "name": "serverUrl",
                                    "type": {
                                        "type": "String"
                                    }
                                },
                                {
                                    "id": 4,
                                    "name": "roomId",
                                    "type": {
                                        "type": "String"
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        },
        "matchServer/PtlRoomServerJoin/ReqRoomServerJoin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "token",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "serverUrl",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "matchServer/PtlRoomServerJoin/ResRoomServerJoin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "matchServer/PtlStartMatch/ReqStartMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "matchServer/PtlStartMatch/ResStartMatch": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "serverUrl",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/clientMsg/MsgUpdateRoomState/MsgUpdateRoomState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "connNum",
                    "type": {
                        "type": "Number",
                        "scalarType": "uint"
                    }
                },
                {
                    "id": 1,
                    "name": "rooms",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Interface",
                            "properties": [
                                {
                                    "id": 0,
                                    "name": "id",
                                    "type": {
                                        "type": "String"
                                    }
                                },
                                {
                                    "id": 1,
                                    "name": "name",
                                    "type": {
                                        "type": "String"
                                    }
                                },
                                {
                                    "id": 2,
                                    "name": "userNum",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                },
                                {
                                    "id": 3,
                                    "name": "maxUserNum",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                },
                                {
                                    "id": 4,
                                    "name": "startMatchTime",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    },
                                    "optional": true
                                },
                                {
                                    "id": 5,
                                    "name": "updateTime",
                                    "type": {
                                        "type": "Number",
                                        "scalarType": "uint"
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        },
        "roomServer/clientMsg/MsgUserState/MsgUserState": {
            "target": {
                "type": "Reference",
                "target": "../types/RoomUserState/RoomUserState"
            },
            "keys": [
                "uid"
            ],
            "type": "Omit"
        },
        "../types/RoomUserState/RoomUserState": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uid",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "pos",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 2,
                    "name": "rotation",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "x",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 1,
                                "name": "y",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 2,
                                "name": "z",
                                "type": {
                                    "type": "Number"
                                }
                            },
                            {
                                "id": 3,
                                "name": "w",
                                "type": {
                                    "type": "Number"
                                }
                            }
                        ]
                    }
                },
                {
                    "id": 3,
                    "name": "aniState",
                    "type": {
                        "type": "Reference",
                        "target": "../types/RoomUserState/PlayerAniState"
                    }
                }
            ]
        },
        "../types/RoomUserState/PlayerAniState": {
            "type": "Union",
            "members": [
                {
                    "id": 0,
                    "type": {
                        "type": "Literal",
                        "literal": "idle"
                    }
                },
                {
                    "id": 1,
                    "type": {
                        "type": "Literal",
                        "literal": "walking"
                    }
                },
                {
                    "id": 2,
                    "type": {
                        "type": "Literal",
                        "literal": "wave"
                    }
                },
                {
                    "id": 3,
                    "type": {
                        "type": "Literal",
                        "literal": "punch"
                    }
                },
                {
                    "id": 4,
                    "type": {
                        "type": "Literal",
                        "literal": "dance"
                    }
                }
            ]
        },
        "roomServer/PtlAuth/ReqAuth": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 2,
                    "name": "matchConnectToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "type",
                    "type": {
                        "type": "Literal",
                        "literal": "MatchServer"
                    }
                }
            ]
        },
        "roomServer/PtlAuth/ResAuth": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "roomServer/PtlCreateRoom/ReqCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 2,
                    "name": "matchConnectToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomName",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/PtlCreateRoom/ResCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/PtlExitRoom/ReqExitRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "roomServer/PtlExitRoom/ResExitRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "roomServer/PtlJoinRoom/ReqJoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "nickname",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/PtlJoinRoom/ResJoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "currentUser",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "roomData",
                    "type": {
                        "type": "Reference",
                        "target": "../types/RoomData/RoomData"
                    }
                }
            ]
        },
        "../types/UserInfo/UserInfo": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "nickname",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "isReady",
                    "type": {
                        "type": "Boolean"
                    },
                    "optional": true
                }
            ]
        },
        "../types/RoomData/RoomData": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "id",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "name",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "maxUser",
                    "type": {
                        "type": "Number",
                        "scalarType": "uint"
                    }
                },
                {
                    "id": 3,
                    "name": "users",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Intersection",
                            "members": [
                                {
                                    "id": 0,
                                    "type": {
                                        "type": "Reference",
                                        "target": "../types/UserInfo/UserInfo"
                                    }
                                },
                                {
                                    "id": 1,
                                    "type": {
                                        "type": "Interface",
                                        "properties": [
                                            {
                                                "id": 0,
                                                "name": "color",
                                                "type": {
                                                    "type": "Interface",
                                                    "properties": [
                                                        {
                                                            "id": 0,
                                                            "name": "r",
                                                            "type": {
                                                                "type": "Number",
                                                                "scalarType": "uint"
                                                            }
                                                        },
                                                        {
                                                            "id": 1,
                                                            "name": "g",
                                                            "type": {
                                                                "type": "Number",
                                                                "scalarType": "uint"
                                                            }
                                                        },
                                                        {
                                                            "id": 2,
                                                            "name": "b",
                                                            "type": {
                                                                "type": "Number",
                                                                "scalarType": "uint"
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    "id": 8,
                    "name": "ownerId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 4,
                    "name": "messages",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Interface",
                            "properties": [
                                {
                                    "id": 0,
                                    "name": "user",
                                    "type": {
                                        "type": "Reference",
                                        "target": "../types/UserInfo/UserInfo"
                                    }
                                },
                                {
                                    "id": 1,
                                    "name": "time",
                                    "type": {
                                        "type": "Date"
                                    }
                                },
                                {
                                    "id": 2,
                                    "name": "content",
                                    "type": {
                                        "type": "String"
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    "id": 5,
                    "name": "lastEmptyTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 6,
                    "name": "startMatchTime",
                    "type": {
                        "type": "Number"
                    },
                    "optional": true
                },
                {
                    "id": 7,
                    "name": "updateTime",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "roomServer/PtlSendChat/ReqSendChat": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "content",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/PtlSendChat/ResSendChat": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "roomServer/PtlSendInput/ReqSendInput": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "operates",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../types/FrameSync/ConnectionInputOperate"
                        }
                    }
                }
            ]
        },
        "../types/FrameSync/ConnectionInputOperate": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "roomServer/PtlSendInput/ResSendInput": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "roomServer/PtlSetReady/ReqSetReady": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "isReady",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "roomServer/PtlSetReady/ResSetReady": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "needLogin",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgChat/MsgChat": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "content",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgGameStarted/MsgGameStarted": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "message",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgOwnerChanged/MsgOwnerChanged": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "newOwner",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "oldOwner",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgSyncFrame/MsgSyncFrame": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "roomServer/serverMsg/MsgUserExit/MsgUserExit": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgUserJoin/MsgUserJoin": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "color",
                    "type": {
                        "type": "Interface",
                        "properties": [
                            {
                                "id": 0,
                                "name": "r",
                                "type": {
                                    "type": "Number",
                                    "scalarType": "uint"
                                }
                            },
                            {
                                "id": 1,
                                "name": "g",
                                "type": {
                                    "type": "Number",
                                    "scalarType": "uint"
                                }
                            },
                            {
                                "id": 2,
                                "name": "b",
                                "type": {
                                    "type": "Number",
                                    "scalarType": "uint"
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgUserReadyChanged/MsgUserReadyChanged": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "time",
                    "type": {
                        "type": "Date"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "isReady",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "roomServer/serverMsg/MsgUserStates/MsgUserStates": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "userStates",
                    "type": {
                        "type": "Interface",
                        "indexSignature": {
                            "keyType": "String",
                            "type": {
                                "type": "Reference",
                                "target": "../types/RoomUserState/RoomUserState"
                            }
                        }
                    }
                }
            ]
        },
        "userServer/PtlLogin/ReqLogin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "username",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                },
                {
                    "id": 1,
                    "name": "password",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "userServer/PtlLogin/ResLogin": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "__ssoToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../models/CurrentUser/CurrentUser"
                    }
                }
            ]
        },
        "../models/CurrentUser/CurrentUser": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "uid",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 1,
                    "name": "username",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 2,
                    "name": "roles",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "String"
                        }
                    }
                }
            ]
        },
        "userServer/PtlLogout/ReqLogout": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ]
        },
        "userServer/PtlLogout/ResLogout": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ]
        },
        "userServer/PtlRegister/ReqRegister": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseRequest"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "username",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "password",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "userServer/PtlRegister/ResRegister": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "__ssoToken",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "user",
                    "type": {
                        "type": "Reference",
                        "target": "../models/CurrentUser/CurrentUser"
                    }
                }
            ]
        }
    }
};