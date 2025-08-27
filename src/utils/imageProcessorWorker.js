self.onmessage = (event) => {
    const { imgData, width, height } = event.data;
    let lOffset = width,
        rOffset = 0,
        tOffset = height,
        bOffset = 0;

    for (let j = 0; j < height; j++) {
        let rowStart = j * width * 4;
        for (let i = 0; i < width; i++) {
            let pos = rowStart + i * 4;
            if (imgData[pos + 3] > 0) {
                bOffset = Math.max(j, bOffset);
                rOffset = Math.max(i, rOffset);
                tOffset = Math.min(j, tOffset);
                lOffset = Math.min(i, lOffset);
            }
        }
    }

    self.postMessage({ lOffset, rOffset, tOffset, bOffset });
};