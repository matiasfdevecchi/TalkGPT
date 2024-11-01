import { SessionId, AssistanceMessage } from "../core/domain/Action";
import { ClientMessageRepository } from "../core/domain/ClientMessageRepository";

export class InMemoryClientMessageRepository implements ClientMessageRepository {
    private storage: Map<SessionId, AssistanceMessage[]> = new Map();

    async insert(sessionId: SessionId, messages: AssistanceMessage[]): Promise<void> {
        this.storage.set(sessionId, messages);
    }

    async get(sessionId: SessionId): Promise<AssistanceMessage[]> {
        return this.storage.get(sessionId) || [];
    }

    async delete(sessionId: SessionId): Promise<void> {
        this.storage.delete(sessionId);
    }
}
