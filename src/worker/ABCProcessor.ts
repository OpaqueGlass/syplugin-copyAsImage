import { IEventBusMap } from "siyuan";
import { BaseCopyProcessor } from "./baseProcessor";
import { errorPush, logPush } from "@/logger";
import { checkClipboard, copyImageToClipboard, downloadImageFromCanvas, getCanvasFromSVG } from "@/utils/onlyThisUtils";

export class ABCProcessor extends BaseCopyProcessor {
    public test(eventDetail: IEventBusMap["open-noneditableblock"]): boolean {
        const renderElement = eventDetail.renderElement;
        return ["abc"].includes(renderElement.getAttribute("data-subtype"));
    }

    public doAddButton(eventDetail: IEventBusMap["open-noneditableblock"]) {
        const btnElem = this.createButton("og-copy-png", "copy_as_png", "");
        btnElem.addEventListener("click", (event)=>{
            this.copyItem(eventDetail, event.shiftKey || !checkClipboard(true));
        });
        this.addButtonAfter(eventDetail.toolbar.subElement.querySelector("[data-type='export']"),
        [btnElem]);
    }

    public async copyItem(eventDetail: IEventBusMap["open-noneditableblock"], download:boolean): Promise<boolean> {
        const renderElement = eventDetail.renderElement;
        const svgElement = renderElement.querySelector(".protyle-icons + div svg");
        svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        logPush("svg", svgElement);
        getCanvasFromSVG(svgElement, (canvas)=>{
            if (download) {
                downloadImageFromCanvas(canvas);
            } else {
                copyImageToClipboard(canvas);
            }
        });
        return true;
    }
}