export interface WebSocketReceiveMessage {
    type: string;
    data: any;
}

export interface WebSocketSendMessage {
    type: string,
    currentUser: string,
    post_values: {sting: string | null},
    objectId: string

}
