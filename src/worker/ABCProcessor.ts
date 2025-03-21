import { IEventBusMap } from "siyuan";
import { BaseCopyProcessor } from "./baseProcessor";
import { errorPush, logPush } from "@/logger";
import { checkClipboard, copyImageToClipboard, downloadImageFromCanvas, downloadSVG, getCanvasFromSVG } from "@/utils/onlyThisUtils";

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
        const copySVGBtn = this.createButton("og-copy-svg", "download_svg", "ogiconImageDown");
        copySVGBtn.onclick = ()=>{
            const node = this.getSVG(eventDetail);
            if (node) {
                downloadSVG(node);
            }
        };
        this.addButtonAfter(eventDetail.toolbar.subElement.querySelector("[data-type='export']"),
        [btnElem, copySVGBtn]);
    }

    private getSVG(eventDetail: IEventBusMap["open-noneditableblock"]) {
        const renderElement = eventDetail.renderElement;
        const svgElement = renderElement.querySelector(".protyle-icons + div svg");
        svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        logPush("svg", svgElement);
        return svgElement;
    }

    public async copyItem(eventDetail: IEventBusMap["open-noneditableblock"], download:boolean): Promise<boolean> {
        const svgElement = this.getSVG(eventDetail);
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