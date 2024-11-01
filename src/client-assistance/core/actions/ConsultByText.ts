import { AssistanceResponse, SessionId } from "../domain/Action";
import { clientAssistanceService, ClientAssistanceService } from "../domain/ClientAssitanceService";
import { ttsClient, TTSClient } from "../domain/TTSClient";

class ConsultByText {
    constructor(private readonly ttsClient: TTSClient, private readonly clientAssistanceService: ClientAssistanceService) {}
    
    async invoke(id: SessionId, content: string): Promise<AssistanceResponse> {
        const action = await this.clientAssistanceService.consultByText(id, content);
        const audio = await this.ttsClient.generateBase64Audio(action.response);
        return { audio, action };
    }
}

export const consultByText = new ConsultByText(ttsClient, clientAssistanceService);