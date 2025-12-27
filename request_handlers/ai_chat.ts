import AppInfo from "@/library/app_info";
import HttpHandler from "@/library/http_handler";

export class AiChat {
    httpHandler: HttpHandler = new HttpHandler();
    url: string = `${AppInfo.apiUrl}/ai-chat`;
}