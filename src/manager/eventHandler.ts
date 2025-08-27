import { getPluginInstance } from "@/utils/pluginHelper";
import Mutex from "@/utils/mutex";
import { getReadOnlyGSettings } from "@/manager/settingManager";
import { IEventBusMap, Menu, showMessage } from "siyuan";
import { logPush } from "@/logger";
import { PlantUMLProcessor } from "@/worker/plantUMLProcessor";
import { ABCProcessor } from "@/worker/ABCProcessor";
import { CanvasProcessor } from "@/worker/canvasProcessor";
import { MermaidCopyProcessor } from "@/worker/mermaidProcessor";
import { MathCopyProcessor } from "@/worker/mathProcessor";
import { toPng, toSvg } from "html-to-image";
import { copyImageBase64URLToClipboard, copyImageToClipboard, downloadImageBase64URL, getCanvasFromSVG, handleSVGStringToSVGElement } from "@/utils/onlyThisUtils";
import { lang } from "@/utils/lang";
export default class EventHandler {
    private handlerBindList: Record<string, (arg1: CustomEvent)=>void> = {
        "open-noneditableblock": this.bindActionEntry.bind(this), // mutex需要访问EventHandler的属性
        "click-blockicon": this.copyAsImg.bind(this),
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
        const processorList = [new PlantUMLProcessor(), new ABCProcessor(), new CanvasProcessor(), new MermaidCopyProcessor(), new MathCopyProcessor];

        for (const processor of processorList) {
            if (processor.test(event.detail)) {
                if (!processor.isInserted(event.detail)) {
                    processor.doAddButton(event.detail);
                    processor.insertFlag(event.detail);
                }
            }
        }
    }

    async copyAsImg(event: CustomEvent<IEventBusMap["click-blockicon"]>) {
        const htmlElements = event.detail.blockElements;
        logPush("click-block-icon", htmlElements, event.detail.menu);
        event.detail.menu.addItem({
            "label": lang("copy_as_png_only"),
            "click": (element, event)=>{
                logPush("clicked", element);
                const targetElement = htmlElements[0];
                targetElement.classList.remove("protyle-wysiwyg--select");
                // toPng(htmlElements[0]).then((result)=>{
                //     logPush("clicked", result);
                    
                //     copyImageBase64URLToClipboard(result);
                // });
                // 
                toSvg(htmlElements[0]).then((result)=>{
                    const svg = handleSVGStringToSVGElement(result);
                    const foreignObject = svg.querySelector('foreignObject');
                    const scale = 1.1;
                    foreignObject.childNodes[0].setAttribute('transform', `scale(${scale})`);
                    foreignObject.childNodes[0].setAttribute("style", "max-width: 1080px")
                    svg.setAttribute("style", "max-width: 1080px")
                    // 需要更新 SVG 的宽高以匹配缩放后的显示区域
                    // svg.setAttribute('width', parseInt( svg.getAttribute("width")) * scale);
                    // svg.setAttribute('height', parseInt(svg.getAttribute("height")) * scale);
                    logPush("clicked", svg);
                    getCanvasFromSVG(svg, (canvas)=>{
                        copyImageToClipboard(canvas);
                    }, true);
                })
            }
        });
    }
}