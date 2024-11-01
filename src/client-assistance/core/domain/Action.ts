export type SessionId = string;

export type AssistanceMessage = {
    role: "system" | "user" | "assistant";
    content: string;
}

export type AssistanceAction = {
    response: string;
    correction: string;
}

export type AssistanceResponse = {
    audio: string;
    action: AssistanceAction;
}