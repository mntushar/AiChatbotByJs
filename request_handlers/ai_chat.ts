import AppInfo from "@/library/app_info";
import HttpHandler, { StreamCallback } from "@/library/http_handler";

export class AiChat {
    httpHandler: HttpHandler = new HttpHandler();
    url: string = `${AppInfo.apiUrl}/ai-chat`;

    async sendMessage(
        messages: object[],
        onStream?: StreamCallback,
        deepResearch: boolean = false
    ): Promise<string> {
        const data = {
            messages,
            deepReserch: deepResearch,
        }

        return await this.httpHandler
            .posStreamtWithoutToken(this.url, data, onStream);
    }
}