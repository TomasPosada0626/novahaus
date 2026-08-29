(function () {
  const feedback = document.querySelector(".copy-feedback");
  const swatches = document.querySelectorAll(".swatch[data-hex]");

  swatches.forEach((swatch) => {
    swatch.addEventListener("click", async () => {
      const hex = swatch.getAttribute("data-hex");
      try {
        await navigator.clipboard.writeText(hex);
        showFeedback(`Copiado: ${hex}`);
      } catch (err) {
        showFeedback(`No se pudo copiar automáticamente — el código es ${hex}`);
      }
    });
  });

  let feedbackTimer;
  function showFeedback(message) {
    if (!feedback) return;
    feedback.textContent = message;
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      feedback.textContent = "";
    }, 2500);
  }
})();
