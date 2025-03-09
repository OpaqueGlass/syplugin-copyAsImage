// @ts-nocheck
window.MathJax = {
    tex: {
      inlineMath: [
        ["$", "$"],
        ["\\(", "\\)"],
      ], // 行内公式选择符
      displayMath: [
        ["$$", "$$"],
        ["\\[", "\\]"],
      ], // 段内公式选择符
    },
    startup: {
      ready() {
        window.MathJax.startup.defaultReady();
      },
    },
  };
  