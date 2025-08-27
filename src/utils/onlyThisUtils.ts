import { debugPush, logPush, warnPush } from "@/logger";
import "@/utils/mathjax";
import "mathjax/es5/tex-mml-svg";
import { lang } from "./lang";
import { showPluginMessage } from "./common";

export function downloadSVG(svgElement) {
    let hiddenLink = document.createElement("a");
    let svgHTMLCode = serializeSVG(svgElement) //filterSVGouterHTML(svgElement.outerHTML);
    let blob = new Blob([svgHTMLCode], {
        type: "image/svg+xml",
    });
    hiddenLink.href = URL.createObjectURL(blob);
    hiddenLink.download = "export_SVG_" + new Date().toLocaleString() + ".svg";
    hiddenLink.click();
}

export function filterSVGouterHTML(str) {
    return str.replaceAll("<br>", "<br />");
}

export function serializeSVG(svgElement) {
    let serializer = new XMLSerializer();
    let svgXml = serializer.serializeToString(svgElement);
    return svgXml;
}

export async function copySVG(svgElement) {
    throw Error("Not implemented");
    copyPlainTextToClipboard(svgElement.outerHTML);
    let svgHTMLCode = svgElement.outerHTML;
    const base64code = "data:image/svg+xml;base64," + utf8ToBase64(svgHTMLCode);
    logPush("writing to clipboard", base64code);
    const data = await fetch(base64code);
    const item = new ClipboardItem({ "image/svg+xml": data.blob()});
    navigator.clipboard.write([item]);
    showPluginMessage(lang("success:copy"));
}

function utf8ToBase64(str) {
    return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

export function handleSVGStringToSVGElement(dataUrl) {
    // 1. 提取编码后的 SVG 字符串（去掉前缀）
    const encodedSVG = dataUrl.split(',')[1];

    // 2. 解码成原始 SVG XML
    const svgText = decodeURIComponent(encodedSVG);

    // 3. 使用 DOMParser 解析为 SVGElement
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
    const svgElement = svgDoc.documentElement; // 这就是 SVGElement！
    return svgElement;
}

export async function copyImageBase64URLToClipboard(dataUrl) {
    checkClipboard();
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    showPluginMessage(lang("success:copy"));
}

export async function downloadImageBase64URL(dataUrl:string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "downloaded_image_" + new Date().toLocaleString()+ ".png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * SVG to canvas
 * @param svgElement 
 * @param callback 
 * 
 * Generate From: (Under Apache-2.0 license)
 * https://github.com/QianJianTech/LaTeXLive/blob/3703d8fa4e1df598b3384c7ef60af3c3d00385ea/js/latex/action.js#L172-L241
 */
export function getCanvasFromSVG(svgElement, callback, changeSize = true) {
    // Clone the SVG element
    let svgClone = svgElement.cloneNode(true);

    // 获取 SVG 的原始尺寸
    let viewBox = svgElement.viewBox.baseVal;
    let origWidth = viewBox && viewBox.width ? viewBox.width : svgElement.clientWidth || 800;
    let origHeight = viewBox && viewBox.height ? viewBox.height : svgElement.clientHeight || 600;
    let aspectRatio = origWidth / origHeight;

    // 如果需要，设置目标渲染尺寸（保持比例）
    let targetWidth = 1920;
    let targetHeight = Math.round(targetWidth / aspectRatio);

    if (changeSize) {
        svgClone.setAttribute("width", targetWidth + "px");
        svgClone.setAttribute("height", targetHeight + "px");
    }

    // Convert the SVG to XML
    let svgXml = serializeSVG(svgClone);
    let image = new Image();
    image.src = "data:image/svg+xml;base64," + utf8ToBase64(svgXml);

    image.onerror = function (e) {
        console.error("SVG image failed to load", e);
    };

    image.onload = function () {
        // === 第一步：把 SVG 渲染到一个大画布上（保持比例）
        let scale = 2; // 提高分辨率因子（2 = 2倍分辨率，可调节）
        let canvas = document.createElement("canvas");
        canvas.width = targetWidth * scale;
        canvas.height = targetHeight * scale;

        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        // === 第二步：检测非透明区域
        let imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let lOffset = canvas.width,
            rOffset = 0,
            tOffset = canvas.height,
            bOffset = 0;

        for (let i = 0; i < canvas.width; i++) {
            for (let j = 0; j < canvas.height; j++) {
                let pos = (i + canvas.width * j) * 4;
                if (
                    imgData[pos] > 0 ||
                    imgData[pos + 1] > 0 ||
                    imgData[pos + 2] > 0 ||
                    imgData[pos + 3] > 0
                ) {
                    bOffset = Math.max(j, bOffset);
                    rOffset = Math.max(i, rOffset);
                    tOffset = Math.min(j, tOffset);
                    lOffset = Math.min(i, lOffset);
                }
            }
        }

        // === 第三步：裁剪并输出（保持比例）
        let cropWidth = rOffset - lOffset;
        let cropHeight = bOffset - tOffset;

        let canvas2 = document.createElement("canvas");
        canvas2.width = cropWidth;
        canvas2.height = cropHeight;
        let context2 = canvas2.getContext("2d");

        // 裁剪部分原样绘制（不再强行拉伸）
        context2.drawImage(
            canvas,
            lOffset,
            tOffset,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
        );

        callback(canvas2, context2);
    };
}


export function downloadImageFromCanvas(canvas) {
    // Create a hidden link to download the resulting image
    let hiddenLink = document.createElement("a");
    hiddenLink.href = canvas.toDataURL("image/png");
    hiddenLink.download = "downloaded_image_" + new Date().toLocaleString()+ ".png";
    hiddenLink.click();
}

export function copyImageToClipboard(canvas) {
    checkClipboard();
    canvas.toBlob(function (blob) {
        logPush("writing to clipboard");
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
        showPluginMessage(lang("success:copy"));
    });
}

export function copyPlainTextToClipboard(text) {
    checkClipboard();
    const item = new ClipboardItem({ "text/plain": new Blob([text], { type: 'text/plain' }) });
    navigator.clipboard.write([item]);
    showPluginMessage(lang("success:copy"));
}

export function checkClipboard(sendMessage = true) {
    if (!navigator.clipboard) {
        if (sendMessage) {
            showPluginMessage(lang("error:clipboard"));
        }
        return false;
    }
    return true;
}

export function convertToMathML(katexString) {
    try {
        // 使用 KaTeX 将 LaTeX 字符串转换为 MathML
        const katexOutput = window.katex.renderToString(katexString, {
            output: 'mathml',
        });

        // 移除最外层的 <span class="katex"> 标签
        const div = document.createElement('div');
        div.innerHTML = katexOutput;
        const mathML = div.querySelector('math').outerHTML;

        return mathML;
    } catch (error) {
        console.error('Error converting to MathML:', error);
        return '';
    }
}


export async function mathmlToSvg(mathmlString) {
    return new Promise((resolve, reject) => {
        // Ensure MathJax is loaded and configured
        if (typeof MathJax === 'undefined') {
            reject(new Error('MathJax is not loaded'));
            return;
        }

        const div = document.createElement('div');
        div.setAttribute("id", "temp");
        div.style.opacity = "0.0";
        div.style.display = "overflow";
        div.style.zIndex = "-999";
        document.body.appendChild(div);
        div.innerHTML = mathmlString;
        MathJax.typesetPromise([div]).then(() => {
            const svg = div.querySelector('svg');
            if (svg) {
                div.remove();
                resolve(svg);
            } else {
                div.remove();
                reject(new Error('SVG element not found'));
            }
        }).catch((err) => {
            reject(new Error('Error rendering MathML: ' + err.message));
        });
    });
}