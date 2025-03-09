import { getPluginInstance } from "@/utils/pluginHelper";
import Mutex from "@/utils/mutex";
import { getReadOnlyGSettings } from "@/manager/settingManager";
import { IEventBusMap, showMessage } from "siyuan";
import { logPush } from "@/logger";
import { convertToMathML, copyImageToClipboard, copyPlainTextToClipboard, downloadImageFromCanvas, downloadPNG, getPngFromSvg, mathmlToSvg } from "@/utils/onlyThisUtils";
import { htmlTransferParser } from "@/utils/stringUtils";
export default class EventHandler {
    private handlerBindList: Record<string, (arg1: CustomEvent)=>void> = {
        "open-noneditableblock": this.bindActionEntry.bind(this), // mutex需要访问EventHandler的属性
    };
    // 关联的设置项，如果设置项对应为true，则才执行绑定
    private relateGsettingKeyStr: Record<string, string> = {
        "loaded-protyle-static": null, // mutex需要访问EventHandler的属性
        "switch-protyle": null,
        "ws-main": "immediatelyUpdate",
    };

    private loadAndSwitchMutex: Mutex;
    private simpleMutex: number = 0;
    private docIdMutex: Record<string, number> = {};
    constructor() {
        this.loadAndSwitchMutex = new Mutex();
    }

    bindHandler() {
        const plugin = getPluginInstance();
        const g_setting = getReadOnlyGSettings();
        // const g_setting = getReadOnlyGSettings();
        for (let key in this.handlerBindList) {
            if (this.relateGsettingKeyStr[key] == null || g_setting[this.relateGsettingKeyStr[key]]) {
                plugin.eventBus.on(key, this.handlerBindList[key]);
            }
        }
        
    }

    unbindHandler() {
        const plugin = getPluginInstance();
        for (let key in this.handlerBindList) {
            plugin.eventBus.off(key, this.handlerBindList[key]);
        }
    }

    async bindActionEntry(event: CustomEvent<IEventBusMap["open-noneditableblock"]>) {
        // do sth
        logPush("点击了不可编辑块", event.detail);
        const utilElement = event.detail.toolbar.subElement;
        const renderElement = event.detail.renderElement;
        if (renderElement.getAttribute("data-type") == "NodeCodeBlock") {
            if (!utilElement.querySelector("[data-type='og-copy-png']")) {
                const exportBtn = utilElement.querySelector("[data-type=export]");
                const copyBtn = document.createElement("button");
                copyBtn.classList.add(..."block__icon block__icon--show b3-tooltips b3-tooltips__nw".split(" "));
                copyBtn.setAttribute("data-type", "og-copy-png");
                copyBtn.setAttribute("aria-label", "Copy as PNG");
                copyBtn.onclick = ()=>{
                    logPush("Clicked");
                    getPngFromSvg(event.detail.renderElement.querySelector(`.protyle-icons + div svg`), (canvas)=>{copyImageToClipboard(canvas)})
                    // downloadPNG(event.detail.renderElement.querySelector(`.protyle-icons + div svg`))
                };
                copyBtn.innerHTML = `<svg><use xlink:href="#ogiconCopyImage"></use></svg>`;
                exportBtn.insertAdjacentElement("afterend", copyBtn);
                exportBtn.insertAdjacentHTML("afterend", `<span class="fn__space"></span>`);
            }
        }
        if (renderElement.getAttribute("data-type") == "NodeMathBlock"
            || renderElement.getAttribute("data-type") == "inline-math") {
            if (!utilElement.querySelector("[data-type='og-copy-png']")) {
                // 1
                const exportBtn = utilElement.querySelector("[data-type=export]");
                const copyPngBtn = document.createElement("button");
                copyPngBtn.classList.add(..."block__icon block__icon--show b3-tooltips b3-tooltips__nw".split(" "));
                copyPngBtn.setAttribute("data-type", "og-copy-png");
                copyPngBtn.setAttribute("aria-label", "Copy as PNG");
                copyPngBtn.onclick = async () => {
                    logPush("公式content", htmlTransferParser(renderElement.dataset["content"]));
                    const mathml = convertToMathML(htmlTransferParser(renderElement.dataset["content"]));
                    logPush("mathml", mathml);
                    const svgE = await mathmlToSvg(mathml);
                    logPush("svgE",svgE);
                    getPngFromSvg(svgE, (canvas)=>{
                        copyImageToClipboard(canvas);
                    });
                };
                copyPngBtn.innerHTML = `<svg><use xlink:href="#ogiconCopyImage"></use></svg>`;
                exportBtn.insertAdjacentElement("afterend", copyPngBtn);
                exportBtn.insertAdjacentHTML("afterend", `<span class="fn__space"></span>`);

                // 2
                const copyMathMLBtn = document.createElement("button");
                copyMathMLBtn.classList.add(..."block__icon block__icon--show b3-tooltips b3-tooltips__nw".split(" "));
                copyMathMLBtn.setAttribute("data-type", "og-copy-mathml");
                copyMathMLBtn.setAttribute("aria-label", "Copy as MathML");
                copyMathMLBtn.onclick = async () => {
                    logPush("公式content", htmlTransferParser(renderElement.dataset["content"]));
                    const mathml = convertToMathML(htmlTransferParser(renderElement.dataset["content"]));
                    logPush("mathml", mathml);
                    copyPlainTextToClipboard(mathml);
                };
                copyMathMLBtn.innerHTML = `<svg><use xlink:href="#ogiconSquareFunction"></use></svg>`;
                copyPngBtn.insertAdjacentElement("afterend", copyMathMLBtn);
                copyPngBtn.insertAdjacentHTML("afterend", `<span class="fn__space"></span>`);
            }
        }
    }

}