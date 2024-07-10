export interface WebSocketReceiveMessage {
    type: string;
    data: any;
    userToken: string;
}

export interface WebSocketSendMessage {
    type: string,
    currentUser: string,
    post_values: { sting: string | null },
    objectId: string | null

}
