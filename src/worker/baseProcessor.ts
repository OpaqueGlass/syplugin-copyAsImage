import { logPush } from "@/logger";
import { isValidStr } from "@/utils/commonCheck";
import { lang } from "@/utils/lang";
import { IEventBusMap } from "siyuan";

export abstract class BaseCopyProcessor {
    /**
     * 验证当前块是否可以被当前处理器处理
     * @param eventDetail IEventBusMap["open-noneditableblock"]
     * @returns boolean 表示是否可以当前处理函数处理
     */
    public abstract test(eventDetail: IEventBusMap["open-noneditableblock"]): boolean;

    public abstract doAddButton(eventDetail: IEventBusMap["open-noneditableblock"]);
    /**
     * 获取一个封装的图标
     */
    public createButton(dataType:string, langKey:string, svgIconId:string): HTMLElement {
        if (!isValidStr(svgIconId)) {
            svgIconId = "ogiconCopyImage";
        }
        const copyPngBtn = document.createElement("button");
        copyPngBtn.classList.add(..."block__icon block__icon--show b3-tooltips b3-tooltips__nw".split(" "));
        copyPngBtn.setAttribute("data-type", dataType);
        copyPngBtn.setAttribute("aria-label", lang(langKey));
        copyPngBtn.innerHTML = `<svg><use xlink:href="#${svgIconId}"></use></svg>`;
        return copyPngBtn;
    }

    public addButtonAfter(existElem: HTMLElement, buttonList: HTMLElement[]) {
        for (let i = buttonList.length-1; i >=0; i--) {
            logPush("add", buttonList[i]);
            existElem.insertAdjacentElement("afterend", buttonList[i]);
            existElem.insertAdjacentHTML("afterend", `<span class="fn__space"></span>`);
        }
    }

    public insertFlag(eventDetail: IEventBusMap["open-noneditableblock"]) {
        eventDetail.toolbar.subElement.children[0].setAttribute("data-og-added-flag", "true");
    }
    public isInserted(eventDetail: IEventBusMap["open-noneditableblock"]) {
        return eventDetail.toolbar.subElement.children[0].getAttribute("data-og-added-flag") == null ? false:true;
    }
}