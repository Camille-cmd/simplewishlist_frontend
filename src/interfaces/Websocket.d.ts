export interface WebSocketReceiveMessage {
    type: string;
    data: never;
    userToken: string;
    action: string;
    code?: string | null;
}

export interface WebSocketSendMessage {
    type: string,
    currentUser: string,
    postValues: NonNullable<unknown> | null ,
    objectId: string | null

}
