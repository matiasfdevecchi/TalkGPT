import OpenAI from "openai";
import { TTSClient } from "../core/domain/TTSClient";

export class OpenAISdkTTSClient implements TTSClient {

    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        });
    }

    async transcribeAudio(blob: Blob): Promise<string> {
        const file = new File([blob], `${Date.now()}.webm`, { type: 'audio/webm' });

        const response = await this.client.audio.transcriptions.create({
            file,
            model: 'whisper-1',
            language: 'en',
            prompt: 'Transcribe the following audio exactly as it is spoken:',
            temperature: 0,
        });

        return response.text;
    }

    async generateBase64Audio(text: string): Promise<string> {
        const response = await this.client.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: text,
        });

        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Audio = (reader.result as string).split(',')[1];
                resolve(base64Audio);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}