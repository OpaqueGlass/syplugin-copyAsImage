import { logPush, warnPush } from "@/logger";
import html2canvas from "html2canvas";
import { showMessage } from "siyuan";
import "@/utils/mathjax";
import "mathjax/es5/tex-mml-svg";


export function getPngFromSvg(svgElement, callback) {
    // Clone the SVG element
    let svgClone = svgElement.cloneNode(true);

    // Modify attributes of the cloned SVG
    svgClone.setAttribute("width", "1920px");
    svgClone.setAttribute("height", "1080px");

    // Convert the SVG to XML
    let svgXml = svgClone.outerHTML;
    let image = new Image();
    function utf8ToBase64(str) {
        return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }

    image.src = "data:image/svg+xml;base64," + utf8ToBase64(svgXml);
    // image.src = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgXml)));
    logPush("copying");
    image.onload = function () {
        // Create a canvas and draw the image onto it
        logPush("loading");
        let canvas = document.createElement("canvas");
        canvas.width = 3840;
        canvas.height = 2160;
        let context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, 3840, 2160);

        // Extract image data
        var imgData = context.getImageData(0, 0, 3840, 2160).data;
        var lOffset = canvas.width, rOffset = 0, tOffset = canvas.height, bOffset = 0;

        // Find the boundaries of the non-transparent parts of the image
        for (var i = 0; i < canvas.width; i++) {
            for (var j = 0; j < canvas.height; j++) {
                var pos = (i + canvas.width * j) * 4;
                if (imgData[pos] > 0 || imgData[pos + 1] > 0 || imgData[pos + 2] > 0 || imgData[pos + 3] > 0) {
                    bOffset = Math.max(j, bOffset);
                    rOffset = Math.max(i, rOffset);
                    tOffset = Math.min(j, tOffset);
                    lOffset = Math.min(i, lOffset);
                }
            }
        }

        lOffset++;
        rOffset++;
        tOffset++;
        bOffset++;

        // Create a second canvas for the cropped image
        let canvas2 = document.createElement("canvas");
        canvas2.width = rOffset - lOffset + 100;
        canvas2.height = bOffset - tOffset + 100;
        let context2 = canvas2.getContext("2d");

        // Draw the cropped image onto the second canvas
        let w = canvas2.width;
        let h = canvas2.height;
        let ow = 50;
        let oh = 50;
        let nw = canvas2.width;
        let nh = canvas2.height;
        context2.drawImage(canvas, lOffset, tOffset, w, h, ow, oh, nw, nh);

        // Call the callback function with the canvas2 and context2
        callback(canvas2, context2);
    };
}

export function downloadImageFromCanvas(canvas) {
    // Create a hidden link to download the resulting image
    let hiddenLink = document.createElement("a");
    hiddenLink.href = canvas.toDataURL("image/png");
    hiddenLink.download = "downloaded_image_" + new Date().getTime() + ".png";
    hiddenLink.click();
}

export function copyImageToClipboard(canvas) {
    checkClipboard();
    canvas.toBlob(function (blob) {
        logPush("toBlobing");
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]);
        showMessage("PNG image copied!");
    });
}

export function copyPlainTextToClipboard(text) {
    checkClipboard();
    const item = new ClipboardItem({ "text/plain": new Blob([text], { type: 'text/plain' }) });
    navigator.clipboard.write([item]);
    showMessage("MathML copied!");
}

function checkClipboard(sendMessage = true) {
    if (!navigator.clipboard) {
        if (sendMessage) {
            showMessage("由于浏览器安全策略，插件不能将内容写入剪贴板。如果正在使用网络伺服，请尝试使用https安全连接。");
        }
        return false;
    }
    return true;
}

export function getPNGFromElement(element) {
    return new Promise((resolve, reject) => {
        html2canvas(element, { scale: 2 }).then(canvas => {
            resolve(canvas);
        }).catch((err) => {
            reject(err);
        })
    })

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