import { IEventBusMap } from "siyuan";
import { BaseCopyProcessor } from "./baseProcessor";
import { checkClipboard, copyImageToClipboard, downloadImageFromCanvas, getCanvasFromSVG } from "@/utils/onlyThisUtils";

export class CanvasProcessor extends BaseCopyProcessor {
    public test(eventDetail: IEventBusMap["open-noneditableblock"]): boolean {
        const renderElement = eventDetail.renderElement;
        return ["mindmap", "echarts"].includes(renderElement.getAttribute("data-subtype"));
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
        const canvasElement = renderElement.querySelector(".protyle-icons + div canvas");
        if (download) {
            downloadImageFromCanvas(canvasElement);
        } else {
            copyImageToClipboard(canvasElement);
        }
        return true;
    }
}