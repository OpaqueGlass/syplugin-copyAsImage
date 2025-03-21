import { IEventBusMap } from "siyuan";
import { BaseCopyProcessor } from "./baseProcessor";
import { logPush } from "@/logger";
import { checkClipboard, copyImageToClipboard, downloadImageFromCanvas, downloadSVG, getCanvasFromSVG } from "@/utils/onlyThisUtils";

export class MermaidCopyProcessor extends BaseCopyProcessor {
    public async doAddButton(eventDetail: IEventBusMap["open-noneditableblock"]): Promise<boolean> {
        const renderElement = eventDetail.renderElement;
        const copyPngBtn = this.createButton("og-copy-png", "copy_as_png", "ogiconCopyImage");
        copyPngBtn.onclick = (event)=>{
            logPush("Clicked", renderElement.querySelector(`.protyle-icons + div svg`));
            getCanvasFromSVG(renderElement.querySelector(`.protyle-icons + div svg`), (canvas)=>{
                if (event.shiftKey || !checkClipboard(true)) {
                    downloadImageFromCanvas(canvas);
                } else {
                    copyImageToClipboard(canvas);
                }
            });
            // downloadPNG(event.detail.renderElement.querySelector(`.protyle-icons + div svg`))
        };
        const copySVGBtn = this.createButton("og-copy-svg", "download_svg", "ogiconImageDown");
        copySVGBtn.onclick = (event) => {
            downloadSVG(renderElement.querySelector(`.protyle-icons + div svg`));
        }
        this.addButtonAfter(eventDetail.toolbar.subElement.querySelector("[data-type='export']"),
                            [copyPngBtn, copySVGBtn]);
        return true;
    }
    /**
     * 验证当前块是否可以被当前处理器处理
     * @param eventDetail IEventBusMap["open-noneditableblock"]
     * @returns boolean 表示是否可以当前处理函数处理
     */
    public test(eventDetail: IEventBusMap["open-noneditableblock"]): boolean {
        const renderElement = eventDetail.renderElement;
        return ["mermaid", "flowchart", "graphviz"].includes(renderElement.getAttribute("data-subtype"));
    }
}