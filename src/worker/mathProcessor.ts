import { IEventBusMap } from "siyuan";
import { BaseCopyProcessor } from "./baseProcessor";
import { logPush } from "@/logger";
import { htmlTransferParser } from "@/utils/stringUtils";
import { checkClipboard, convertToMathML, copyImageToClipboard, copyPlainTextToClipboard, downloadImageFromCanvas, getCanvasFromSVG, mathmlToSvg } from "@/utils/onlyThisUtils";

export class MathCopyProcessor extends BaseCopyProcessor {
    public async doAddButton(eventDetail: IEventBusMap["open-noneditableblock"]): Promise<boolean> {
        const renderElement = eventDetail.renderElement;
        const copyPngBtn = this.createButton("og-copy-png", "copy_as_png", "ogiconCopyImage");
        copyPngBtn.onclick = async (event) => {
            logPush("公式content", htmlTransferParser(renderElement.dataset["content"]));
            const mathml = convertToMathML(htmlTransferParser(renderElement.dataset["content"]));
            logPush("mathml", mathml);
            const svgE = await mathmlToSvg(mathml);
            logPush("svgE", svgE);
            getCanvasFromSVG(svgE, (canvas) => {
                if (event.shiftKey || !checkClipboard) {
                    downloadImageFromCanvas(canvas)
                } else {
                    copyImageToClipboard(canvas);
                }
            });
        };
        const copyMathMLBtn = this.createButton("og-copy-mathml", "copy_as_mathml", "ogiconSquareFunction");
        copyMathMLBtn.onclick = async () => {
            logPush("公式content", htmlTransferParser(renderElement.dataset["content"]));
            const mathml = convertToMathML(htmlTransferParser(renderElement.dataset["content"]));
            logPush("mathml", mathml);
            copyPlainTextToClipboard(mathml);
        };
        this.addButtonAfter(eventDetail.toolbar.subElement.querySelector("[data-type='export']"),
                            [copyPngBtn, copyMathMLBtn]);
        return true;
    }
    /**
     * 验证当前块是否可以被当前处理器处理
     * @param eventDetail IEventBusMap["open-noneditableblock"]
     * @returns boolean 表示是否可以当前处理函数处理
     */
    public test(eventDetail: IEventBusMap["open-noneditableblock"]): boolean {
        const renderElement = eventDetail.renderElement;
        return ["inline-math", "NodeMathBlock"].includes(renderElement.getAttribute("data-type"));
    }
}