import OpenAI from "openai";
import { AssistanceMessage, AssistanceAction } from "../core/domain/Action";
import { AIClient } from "../core/domain/AIClient";

export class OpenAISdkAIClient implements AIClient {

    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        });
    }

    async consult(messages: AssistanceMessage[]): Promise<{ message: AssistanceMessage; action: AssistanceAction; }> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                max_tokens: 200,
            });

            const assistantMessage = response.choices[0].message.content || "";

            return {
                message: {
                    role: "assistant",
                    content: assistantMessage,
                },
                action: this.extractAction(assistantMessage),
            };
        } catch (error: any) {
            console.error("Error al llamar a la API de OpenAI:", error.response ? error.response.data : error.message);
            throw error;
        }
    }

    getInitialMessage(): AssistanceMessage {
        return {
            role: "system",
            content: `You are an English conversation assistant bot. Your responses should always follow a specific JSON format, ensuring the output can be parsed directly using JSON.parse(). Every response must be structured as follows:
    
    {
        "response": "Your conversation reply here.",
        "correction": "If the user's input contains errors or can be improved, provide a corrected version here. If the input is correct, leave this as an empty string."

    }
    
    Guidelines:
    - Respond only in English.
    - Place your main response to the conversation in the "response" field.
    - If the user's input has grammatical errors or could be better phrased, add a corrected version in "correction." If there's nothing to correct, use an empty string for "correction."
    - Ensure that the entire output is JSON-compatible and does not include any extra text outside the JSON structure.`,
        };
    }



    private extractAction(message: string): AssistanceAction {
        try {
            // Parseamos el contenido del mensaje como JSON
            message = message.replace('```json', '').replace('```', '');
            return JSON.parse(message);
        } catch (error) {
            console.error("Error al extraer la acción del mensaje:", error);
            throw new Error("Error al procesar la acción en el mensaje de la IA.");
        }
    }

}
