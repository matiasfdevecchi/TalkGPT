import { AssistanceAction, AssistanceMessage, SessionId } from "./Action";
import { aiClient, AIClient } from "./AIClient";
import { clientMessageRepository, ClientMessageRepository } from "./ClientMessageRepository";

export class ClientAssistanceService {
    constructor(private clientMessageRepository: ClientMessageRepository, private aiClient: AIClient) { }

    async consultByText(id: SessionId, message: string): Promise<AssistanceAction> {
        const messages = await this.retrieveMessages(id);
        const newMessage: AssistanceMessage = { role: "user", content: message };
        const updatedMessages = messages.concat(newMessage);
        const { message: response, action } = await this.aiClient.consult(updatedMessages);
        await this.clientMessageRepository.insert(id, [...updatedMessages, response]);
        return action;
    }

    async removeSession(id: SessionId) {
        await this.clientMessageRepository.delete(id);
    }

    private async retrieveMessages(id: SessionId): Promise<AssistanceMessage[]> {
        const messages = await this.clientMessageRepository.get(id);
        if (messages.length === 0) {
            return [await this.initialMessage()];
        }
        return messages;
    }

    private async initialMessage(): Promise<AssistanceMessage> {
        return this.aiClient.getInitialMessage();
    }
}

export const clientAssistanceService = new ClientAssistanceService(clientMessageRepository, aiClient);