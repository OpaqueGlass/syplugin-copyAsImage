import { getPluginInstance } from "@/utils/pluginHelper";
import Mutex from "@/utils/mutex";
import { getReadOnlyGSettings } from "@/manager/settingManager";
import { IEventBusMap, showMessage } from "siyuan";
import { logPush } from "@/logger";
import { PlantUMLProcessor } from "@/worker/plantUMLProcessor";
import { ABCProcessor } from "@/worker/ABCProcessor";
import { CanvasProcessor } from "@/worker/canvasProcessor";
import { MermaidCopyProcessor } from "@/worker/mermaidProcessor";
import { MathCopyProcessor } from "@/worker/mathProcessor";
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
}