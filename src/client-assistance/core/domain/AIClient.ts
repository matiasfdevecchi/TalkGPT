import { OpenAISdkAIClient } from "../../infrastructure/OpenAISdkAIClient";
import { AssistanceAction, AssistanceMessage } from "./Action";

type ConsultResponse = {
    message: AssistanceMessage;
    action: AssistanceAction;
}

export interface AIClient {
    consult(messages: AssistanceMessage[]): Promise<ConsultResponse>;
    getInitialMessage(): AssistanceMessage;
}

export const aiClient = new OpenAISdkAIClient();