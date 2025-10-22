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
import { ReqExitGame, ResExitGame } from './roomServer/PtlExitGame';
import { ReqExitRoom, ResExitRoom } from './roomServer/PtlExitRoom';
import { ReqGameOver, ResGameOver } from './roomServer/PtlGameOver';
import { ReqJoinRoom, ResJoinRoom } from './roomServer/PtlJoinRoom';
import { ReqPauseFrameSync, ResPauseFrameSync } from './roomServer/PtlPauseFrameSync';
import { ReqRejoinRoom, ResRejoinRoom } from './roomServer/PtlRejoinRoom';
import { ReqRequestGameState, ResRequestGameState } from './roomServer/PtlRequestGameState';
import { ReqResumeFrameSync, ResResumeFrameSync } from './roomServer/PtlResumeFrameSync';
import { ReqSendChat, ResSendChat } from './roomServer/PtlSendChat';
import { ReqSendInput, ResSendInput } from './roomServer/PtlSendInput';
import { ReqSetReady, ResSetReady } from './roomServer/PtlSetReady';
import { MsgChat } from './roomServer/serverMsg/MsgChat';
import { MsgGameOver } from './roomServer/serverMsg/MsgGameOver';
import { MsgGameStarted } from './roomServer/serverMsg/MsgGameStarted';
import { MsgOwnerChanged } from './roomServer/serverMsg/MsgOwnerChanged';
import { MsgSyncFrame } from './roomServer/serverMsg/MsgSyncFrame';
import { MsgUserExit } from './roomServer/serverMsg/MsgUserExit';
import { MsgUserJoin } from './roomServer/serverMsg/MsgUserJoin';
import { MsgUserOffline } from './roomServer/serverMsg/MsgUserOffline';
import { MsgUserOnline } from './roomServer/serverMsg/MsgUserOnline';
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
        "roomServer/ExitGame": {
            req: ReqExitGame,
            res: ResExitGame
        },
        "roomServer/ExitRoom": {
            req: ReqExitRoom,
            res: ResExitRoom
        },
        "roomServer/GameOver": {
            req: ReqGameOver,
            res: ResGameOver
        },
        "roomServer/JoinRoom": {
            req: ReqJoinRoom,
            res: ResJoinRoom
        },
        "roomServer/PauseFrameSync": {
            req: ReqPauseFrameSync,
            res: ResPauseFrameSync
        },
        "roomServer/RejoinRoom": {
            req: ReqRejoinRoom,
            res: ResRejoinRoom
        },
        "roomServer/RequestGameState": {
            req: ReqRequestGameState,
            res: ResRequestGameState
        },
        "roomServer/ResumeFrameSync": {
            req: ReqResumeFrameSync,
            res: ResResumeFrameSync
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
        "roomServer/serverMsg/GameOver": MsgGameOver,
        "roomServer/serverMsg/GameStarted": MsgGameStarted,
        "roomServer/serverMsg/OwnerChanged": MsgOwnerChanged,
        "roomServer/serverMsg/SyncFrame": MsgSyncFrame,
        "roomServer/serverMsg/UserExit": MsgUserExit,
        "roomServer/serverMsg/UserJoin": MsgUserJoin,
        "roomServer/serverMsg/UserOffline": MsgUserOffline,
        "roomServer/serverMsg/UserOnline": MsgUserOnline,
        "roomServer/serverMsg/UserReadyChanged": MsgUserReadyChanged,
        "roomServer/serverMsg/UserStates": MsgUserStates
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 41,
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
            "id": 47,
            "name": "roomServer/ExitGame",
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
            "id": 42,
            "name": "roomServer/GameOver",
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
            "id": 40,
            "name": "roomServer/PauseFrameSync",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 44,
            "name": "roomServer/RejoinRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 48,
            "name": "roomServer/RequestGameState",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 41,
            "name": "roomServer/ResumeFrameSync",
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
            "id": 43,
            "name": "roomServer/serverMsg/GameOver",
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
            "id": 45,
            "name": "roomServer/serverMsg/UserOffline",
            "type": "msg"
        },
        {
            "id": 46,
            "name": "roomServer/serverMsg/UserOnline",
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
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "states",
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
        "../types/RoomUserState/RoomUserState": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
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
        "roomServer/PtlExitGame/ReqExitGame": {
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
        "roomServer/PtlExitGame/ResExitGame": {
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
        "roomServer/PtlGameOver/ReqGameOver": {
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
                    "name": "playerId",
                    "type": {
                        "type": "String"
                    }
                }
            ]
        },
        "roomServer/PtlGameOver/ResGameOver": {
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
                },
                {
                    "id": 3,
                    "name": "isOffline",
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
                    "id": 9,
                    "name": "seed",
                    "type": {
                        "type": "Number"
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
                    "id": 10,
                    "name": "gamePhase",
                    "type": {
                        "type": "Reference",
                        "target": "../types/GamePhase/GamePhase"
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
        "../types/GamePhase/GamePhase": {
            "type": "Enum",
            "members": [
                {
                    "id": 0,
                    "value": "WAITING"
                },
                {
                    "id": 1,
                    "value": "PLAYING"
                },
                {
                    "id": 2,
                    "value": "FINISHED"
                }
            ]
        },
        "roomServer/PtlPauseFrameSync/ReqPauseFrameSync": {
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
        "roomServer/PtlPauseFrameSync/ResPauseFrameSync": {
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
        "roomServer/PtlRejoinRoom/ReqRejoinRoom": {
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
                    "name": "roomId",
                    "type": {
                        "type": "String"
                    },
                    "optional": true
                }
            ]
        },
        "roomServer/PtlRejoinRoom/ResRejoinRoom": {
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
                    "name": "roomData",
                    "type": {
                        "type": "Reference",
                        "target": "../types/RoomData/RoomData"
                    }
                },
                {
                    "id": 1,
                    "name": "currentUser",
                    "type": {
                        "type": "Reference",
                        "target": "../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "isRejoin",
                    "type": {
                        "type": "Boolean"
                    }
                },
                {
                    "id": 3,
                    "name": "gamePhase",
                    "type": {
                        "type": "Reference",
                        "target": "../types/GamePhase/GamePhase"
                    }
                }
            ]
        },
        "roomServer/PtlRequestGameState/ReqRequestGameState": {
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
        "roomServer/PtlRequestGameState/ResRequestGameState": {
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
                    "name": "stateData",
                    "type": {
                        "type": "Any"
                    }
                },
                {
                    "id": 1,
                    "name": "stateFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 2,
                    "name": "afterFrames",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../types/FrameSync/GameSyncFrame"
                        }
                    }
                },
                {
                    "id": 3,
                    "name": "startFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                },
                {
                    "id": 4,
                    "name": "currentFrameIndex",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "../types/FrameSync/GameSyncFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "connectionInputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../types/FrameSync/ConnectionInputFrame"
                        }
                    }
                }
            ],
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "../types/FrameSync/ConnectionInputFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "connectionId",
                    "type": {
                        "type": "String"
                    }
                },
                {
                    "id": 1,
                    "name": "operates",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../types/FrameSync/ConnectionInputOperate"
                        }
                    }
                }
            ],
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
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
        "roomServer/PtlResumeFrameSync/ReqResumeFrameSync": {
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
        "roomServer/PtlResumeFrameSync/ResResumeFrameSync": {
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
        "roomServer/serverMsg/MsgGameOver/MsgGameOver": {
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
                },
                {
                    "id": 2,
                    "name": "playerId",
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
        "roomServer/serverMsg/MsgUserOffline/MsgUserOffline": {
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
        "roomServer/serverMsg/MsgUserOnline/MsgUserOnline": {
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