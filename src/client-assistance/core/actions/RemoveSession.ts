import { SessionId } from "../domain/Action";
import { clientAssistanceService, ClientAssistanceService } from "../domain/ClientAssitanceService";

class RemoveSession {
    constructor(private readonly clientAssistanceService: ClientAssistanceService) {}
    
    async invoke(id: SessionId): Promise<void> {
        return this.clientAssistanceService.removeSession(id);
    }
}

export const removeSession = new RemoveSession(clientAssistanceService);