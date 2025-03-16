import { IEventBusMap } from "siyuan";
import { BaseCopyProcessor } from "./baseProcessor";
import { errorPush, logPush } from "@/logger";
import { checkClipboard, copyImageToClipboard, downloadImageFromCanvas, getCanvasFromSVG } from "@/utils/onlyThisUtils";

export class PlantUMLProcessor extends BaseCopyProcessor {
    public test(eventDetail: IEventBusMap["open-noneditableblock"]): boolean {
        const renderElement = eventDetail.renderElement;
        return ["plantuml"].includes(renderElement.getAttribute("data-subtype"));
    }

    public doAddButton(eventDetail: IEventBusMap["open-noneditableblock"]) {
        const btnElem = this.createButton("og-copy-png", "copy_as_png", "");
        btnElem.addEventListener("click", (event)=>{
            this.copyItem(eventDetail, event.shiftKey || !checkClipboard(true));
        });
        this.addButtonAfter(eventDetail.toolbar.subElement.querySelector("[data-type='export']"),
        [btnElem]);
    }

    public async copyItem(eventDetail: IEventBusMap["open-noneditableblock"], download: boolean): Promise<boolean> {
        const renderElement = eventDetail.renderElement;
        const objectE = renderElement.querySelector(".protyle-icons + div object");
        const dataUrl = objectE.getAttribute("data");
        let documentNode: Element = null;
        try {
            const response = await fetch(dataUrl);
            const html = await response.text();
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, 'text/html');
            documentNode = doc.documentElement;
            documentNode = documentNode.querySelector("svg");
        } catch (error) {
            errorPush('无法访问URL内容:', error);
            return false;
        }
        documentNode.removeAttribute("preserveAspectRatio");
        logPush("svg", documentNode);
        getCanvasFromSVG(documentNode, (canvas)=>{
            if (download) {
                downloadImageFromCanvas(canvas);
            } else {
                copyImageToClipboard(canvas);
            }
        });
        documentNode.remove();
        return true;
    }
}