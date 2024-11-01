import { AssistanceResponse, SessionId } from "../domain/Action";
import { clientAssistanceService, ClientAssistanceService } from "../domain/ClientAssitanceService";
import { ttsClient, TTSClient } from "../domain/TTSClient";



class ConsultByAudio {
    constructor(private readonly ttsClient: TTSClient, private readonly clientAssistanceService: ClientAssistanceService) { }

    async invoke(id: SessionId, blob: Blob): Promise<[string, AssistanceResponse]> {
        const content = await this.ttsClient.transcribeAudio(blob);
        const action = await this.clientAssistanceService.consultByText(id, content);
        const audio = await this.ttsClient.generateBase64Audio(action.response);

        return [content, { audio, action }];
    }
}

export const consultByAudio = new ConsultByAudio(ttsClient, clientAssistanceService);