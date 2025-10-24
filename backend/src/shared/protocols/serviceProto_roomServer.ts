import { ServiceProto } from 'tsrpc-proto';
import { MsgUpdateRoomState } from './roomServer/clientMsg/MsgUpdateRoomState';
import { MsgUserState } from './roomServer/clientMsg/MsgUserState';
import { ReqAuth, ResAuth } from './roomServer/PtlAuth';
import { ReqCreateRoom, ResCreateRoom } from './roomServer/PtlCreateRoom';
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
import { MsgExitGame } from './roomServer/serverMsg/MsgExitGame';
import { MsgGameOver } from './roomServer/serverMsg/MsgGameOver';
import { MsgGameStarted } from './roomServer/serverMsg/MsgGameStarted';
import { MsgHpSync } from './roomServer/serverMsg/MsgHpSync';
import { MsgOwnerChanged } from './roomServer/serverMsg/MsgOwnerChanged';
import { MsgSyncFrame } from './roomServer/serverMsg/MsgSyncFrame';
import { MsgUserExit } from './roomServer/serverMsg/MsgUserExit';
import { MsgUserJoin } from './roomServer/serverMsg/MsgUserJoin';
import { MsgUserOffline } from './roomServer/serverMsg/MsgUserOffline';
import { MsgUserOnline } from './roomServer/serverMsg/MsgUserOnline';
import { MsgUserReadyChanged } from './roomServer/serverMsg/MsgUserReadyChanged';

export interface ServiceType {
    api: {
        "Auth": {
            req: ReqAuth,
            res: ResAuth
        },
        "CreateRoom": {
            req: ReqCreateRoom,
            res: ResCreateRoom
        },
        "ExitGame": {
            req: ReqExitGame,
            res: ResExitGame
        },
        "ExitRoom": {
            req: ReqExitRoom,
            res: ResExitRoom
        },
        "GameOver": {
            req: ReqGameOver,
            res: ResGameOver
        },
        "JoinRoom": {
            req: ReqJoinRoom,
            res: ResJoinRoom
        },
        "PauseFrameSync": {
            req: ReqPauseFrameSync,
            res: ResPauseFrameSync
        },
        "RejoinRoom": {
            req: ReqRejoinRoom,
            res: ResRejoinRoom
        },
        "RequestGameState": {
            req: ReqRequestGameState,
            res: ResRequestGameState
        },
        "ResumeFrameSync": {
            req: ReqResumeFrameSync,
            res: ResResumeFrameSync
        },
        "SendChat": {
            req: ReqSendChat,
            res: ResSendChat
        },
        "SendInput": {
            req: ReqSendInput,
            res: ResSendInput
        },
        "SetReady": {
            req: ReqSetReady,
            res: ResSetReady
        }
    },
    msg: {
        "clientMsg/UpdateRoomState": MsgUpdateRoomState,
        "clientMsg/UserState": MsgUserState,
        "serverMsg/Chat": MsgChat,
        "serverMsg/ExitGame": MsgExitGame,
        "serverMsg/GameOver": MsgGameOver,
        "serverMsg/GameStarted": MsgGameStarted,
        "serverMsg/HpSync": MsgHpSync,
        "serverMsg/OwnerChanged": MsgOwnerChanged,
        "serverMsg/SyncFrame": MsgSyncFrame,
        "serverMsg/UserExit": MsgUserExit,
        "serverMsg/UserJoin": MsgUserJoin,
        "serverMsg/UserOffline": MsgUserOffline,
        "serverMsg/UserOnline": MsgUserOnline,
        "serverMsg/UserReadyChanged": MsgUserReadyChanged
    }
}

export const serviceProto: ServiceProto<ServiceType> = {
    "version": 24,
    "services": [
        {
            "id": 11,
            "name": "clientMsg/UpdateRoomState",
            "type": "msg",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 3,
            "name": "clientMsg/UserState",
            "type": "msg"
        },
        {
            "id": 12,
            "name": "Auth",
            "type": "api",
            "conf": {}
        },
        {
            "id": 13,
            "name": "CreateRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 29,
            "name": "ExitGame",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 4,
            "name": "ExitRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 24,
            "name": "GameOver",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 5,
            "name": "JoinRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 22,
            "name": "PauseFrameSync",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 26,
            "name": "RejoinRoom",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 30,
            "name": "RequestGameState",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 23,
            "name": "ResumeFrameSync",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 6,
            "name": "SendChat",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 18,
            "name": "SendInput",
            "type": "api",
            "conf": {
                "needLogin": true
            }
        },
        {
            "id": 14,
            "name": "SetReady",
            "type": "api"
        },
        {
            "id": 7,
            "name": "serverMsg/Chat",
            "type": "msg"
        },
        {
            "id": 31,
            "name": "serverMsg/ExitGame",
            "type": "msg"
        },
        {
            "id": 25,
            "name": "serverMsg/GameOver",
            "type": "msg"
        },
        {
            "id": 20,
            "name": "serverMsg/GameStarted",
            "type": "msg"
        },
        {
            "id": 32,
            "name": "serverMsg/HpSync",
            "type": "msg"
        },
        {
            "id": 15,
            "name": "serverMsg/OwnerChanged",
            "type": "msg"
        },
        {
            "id": 21,
            "name": "serverMsg/SyncFrame",
            "type": "msg"
        },
        {
            "id": 8,
            "name": "serverMsg/UserExit",
            "type": "msg"
        },
        {
            "id": 9,
            "name": "serverMsg/UserJoin",
            "type": "msg"
        },
        {
            "id": 27,
            "name": "serverMsg/UserOffline",
            "type": "msg"
        },
        {
            "id": 28,
            "name": "serverMsg/UserOnline",
            "type": "msg"
        },
        {
            "id": 16,
            "name": "serverMsg/UserReadyChanged",
            "type": "msg"
        }
    ],
    "types": {
        "clientMsg/MsgUpdateRoomState/MsgUpdateRoomState": {
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
        "clientMsg/MsgUserState/MsgUserState": {
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
                                "target": "../../types/RoomUserState/RoomUserState"
                            }
                        }
                    }
                }
            ]
        },
        "../../types/RoomUserState/RoomUserState": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "PtlAuth/ReqAuth": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
        "../base/BaseRequest": {
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
        "PtlAuth/ResAuth": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "../base/BaseResponse": {
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
        "PtlCreateRoom/ReqCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
        "PtlCreateRoom/ResCreateRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
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
        "PtlExitGame/ReqExitGame": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ]
        },
        "PtlExitGame/ResExitGame": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlExitRoom/ReqExitRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ]
        },
        "PtlExitRoom/ResExitRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlGameOver/ReqGameOver": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
        "PtlGameOver/ResGameOver": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlJoinRoom/ReqJoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
        "PtlJoinRoom/ResJoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "currentUser",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 1,
                    "name": "roomData",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/RoomData/RoomData"
                    }
                }
            ]
        },
        "../../types/UserInfo/UserInfo": {
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
                },
                {
                    "id": 4,
                    "name": "gamePhase",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/GamePhase/GamePhase"
                    }
                }
            ]
        },
        "../../types/GamePhase/GamePhase": {
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
        "../../types/RoomData/RoomData": {
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
                                        "target": "../../types/UserInfo/UserInfo"
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
                                        "target": "../../types/UserInfo/UserInfo"
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
                },
                {
                    "id": 10,
                    "name": "gamePhase",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/GamePhase/GamePhase"
                    }
                }
            ]
        },
        "PtlPauseFrameSync/ReqPauseFrameSync": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ]
        },
        "PtlPauseFrameSync/ResPauseFrameSync": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlRejoinRoom/ReqRejoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
        "PtlRejoinRoom/ResRejoinRoom": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ],
            "properties": [
                {
                    "id": 0,
                    "name": "roomData",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/RoomData/RoomData"
                    }
                },
                {
                    "id": 1,
                    "name": "currentUser",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "isRejoin",
                    "type": {
                        "type": "Boolean"
                    }
                }
            ]
        },
        "PtlRequestGameState/ReqRequestGameState": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ]
        },
        "PtlRequestGameState/ResRequestGameState": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
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
                            "target": "../../types/FrameSync/GameSyncFrame"
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
        "../../types/FrameSync/GameSyncFrame": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "connectionInputs",
                    "type": {
                        "type": "Array",
                        "elementType": {
                            "type": "Reference",
                            "target": "../../types/FrameSync/ConnectionInputFrame"
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
        "../../types/FrameSync/ConnectionInputFrame": {
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
                            "target": "../../types/FrameSync/ConnectionInputOperate"
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
        "../../types/FrameSync/ConnectionInputOperate": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "PtlResumeFrameSync/ReqResumeFrameSync": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
                    }
                }
            ]
        },
        "PtlResumeFrameSync/ResResumeFrameSync": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlSendChat/ReqSendChat": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
        "PtlSendChat/ResSendChat": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlSendInput/ReqSendInput": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseRequest"
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
                            "target": "../../types/FrameSync/ConnectionInputOperate"
                        }
                    }
                }
            ]
        },
        "PtlSendInput/ResSendInput": {
            "type": "Interface",
            "extends": [
                {
                    "id": 0,
                    "type": {
                        "type": "Reference",
                        "target": "../base/BaseResponse"
                    }
                }
            ]
        },
        "PtlSetReady/ReqSetReady": {
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
        "PtlSetReady/ResSetReady": {
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
        "serverMsg/MsgChat/MsgChat": {
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
                        "target": "../../types/UserInfo/UserInfo"
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
        "serverMsg/MsgExitGame/MsgExitGame": {
            "type": "Interface"
        },
        "serverMsg/MsgGameOver/MsgGameOver": {
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
        "serverMsg/MsgGameStarted/MsgGameStarted": {
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
        "serverMsg/MsgHpSync/MsgHpSync": {
            "type": "Interface",
            "properties": [
                {
                    "id": 0,
                    "name": "hpData",
                    "type": {
                        "type": "Interface",
                        "indexSignature": {
                            "keyType": "String",
                            "type": {
                                "type": "Number"
                            }
                        }
                    }
                },
                {
                    "id": 1,
                    "name": "timestamp",
                    "type": {
                        "type": "Number"
                    }
                }
            ]
        },
        "serverMsg/MsgOwnerChanged/MsgOwnerChanged": {
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
                        "target": "../../types/UserInfo/UserInfo"
                    }
                },
                {
                    "id": 2,
                    "name": "oldOwner",
                    "type": {
                        "type": "Reference",
                        "target": "../../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "serverMsg/MsgSyncFrame/MsgSyncFrame": {
            "type": "Interface",
            "indexSignature": {
                "keyType": "String",
                "type": {
                    "type": "Any"
                }
            }
        },
        "serverMsg/MsgUserExit/MsgUserExit": {
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
                        "target": "../../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "serverMsg/MsgUserJoin/MsgUserJoin": {
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
                        "target": "../../types/UserInfo/UserInfo"
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
        "serverMsg/MsgUserOffline/MsgUserOffline": {
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
                        "target": "../../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "serverMsg/MsgUserOnline/MsgUserOnline": {
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
                        "target": "../../types/UserInfo/UserInfo"
                    }
                }
            ]
        },
        "serverMsg/MsgUserReadyChanged/MsgUserReadyChanged": {
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
                        "target": "../../types/UserInfo/UserInfo"
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
        }
    }
};