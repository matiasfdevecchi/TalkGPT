import { InMemoryClientMessageRepository } from "../../infrastructure/InMemoryClientMessageRepository";
import { AssistanceMessage, SessionId } from "./Action";

export interface ClientMessageRepository {
    insert(sessionId: SessionId, actions: AssistanceMessage[]): Promise<void>;
    get(sessionId: SessionId): Promise<AssistanceMessage[]>;
    delete(sessionId: SessionId): Promise<void>;
}

export const clientMessageRepository = new InMemoryClientMessageRepository();