document.addEventListener("DOMContentLoaded", () => {
    const inputScreen = document.getElementById("inputScreen");
    const breathingScreen = document.getElementById("breathingScreen");
    const finalScreen = document.getElementById("finalScreen");
  
    const thoughtsInput = document.getElementById("thoughtsInput");
    const submitButton = document.getElementById("submitButton");
    const breathingPrompt = document.getElementById("breathingPrompt");
    const yesBreathing = document.getElementById("yesBreathing");
    const noBreathing = document.getElementById("noBreathing");
  
    const breathingText = document.getElementById("breathingText");
    const breathingBall = document.getElementById("breathingBall");
    const lineTrack = document.querySelector(".line-track");
  
    thoughtsInput.addEventListener("input", () => {
      submitButton.disabled = !thoughtsInput.value.trim();
    });
  
    submitButton.addEventListener("click", () => {
      const thoughts = thoughtsInput.value.trim();
      if (thoughts) {
        submitButton.disabled = true;
        breathingPrompt.classList.remove("hidden");
      }
    });
  
    yesBreathing.addEventListener("click", () => {
      inputScreen.classList.add("hidden");
      breathingScreen.classList.remove("hidden");
      breathingPrompt.classList.add("hidden");
      startBreathingCycle();
    });
  
    noBreathing.addEventListener("click", () => {
      breathingPrompt.classList.add("hidden");
    });
  
    function startBreathingCycle() {
      let isInhale = true;
      let cycle = 0;
      const totalCycles = 10; // 10 inhale + 10 exhale = 60s
  
      const interval = setInterval(() => {
        breathingText.style.opacity = 0;
  
        setTimeout(() => {
          breathingText.textContent = isInhale ? "Breathe in" : "Breathe out";
          breathingText.style.opacity = 1;
  
          // Animate ball
          const trackWidth = lineTrack.offsetWidth - breathingBall.offsetWidth;
          breathingBall.style.left = isInhale ? "0px" : `${trackWidth}px`;
  
          isInhale = !isInhale;
          cycle++;
          if (cycle >= totalCycles * 2) {
            clearInterval(interval);
            setTimeout(() => {
              breathingScreen.classList.add("hidden");
              finalScreen.classList.remove("hidden");
            }, 3000);
          }
        }, 500); // fade delay
      }, 3000);
    }
  });
  
