import { OpenAISdkTTSClient } from "../../infrastructure/OpenAISdkTTSClient";

export interface TTSClient {
    transcribeAudio(blob: Blob): Promise<string>;
    generateBase64Audio(text: string): Promise<string>;
}

export const ttsClient = new OpenAISdkTTSClient();