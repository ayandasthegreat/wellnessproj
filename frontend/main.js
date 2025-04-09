document.addEventListener("DOMContentLoaded", () => {
    const inputScreen = document.getElementById("inputScreen");
    const blankScreen = document.getElementById("blankScreen");
    const inputTitle = document.getElementById("inputTitle");
    const inputSection = document.getElementById("inputSection");
    const thoughtsInput = document.getElementById("thoughtsInput");
    const submitButton = document.getElementById("submitButton");
    const newEntryButton = document.getElementById("newEntryButton");
    const customCssSpace = document.getElementById("customCssSpace");
  
    thoughtsInput.addEventListener("input", () => {
      submitButton.disabled = !thoughtsInput.value.trim();
    });
  
    submitButton.addEventListener("click", () => {
      const thoughts = thoughtsInput.value.trim();
      if (thoughts) {
        inputTitle.classList.add("fade-out");
        inputSection.classList.add("fade-out");
  
        setTimeout(() => {
          inputScreen.classList.add("hidden");
          blankScreen.classList.remove("hidden");
  
          showLoader();
  
          // Optional: Remove or replace loader after 60s
          setTimeout(() => {
            // For now it just logs — you can replace this with a transition, message, etc.
            console.log("60 seconds of animation complete.");
          }, 60000);
        }, 500);
      }
    });
  
    newEntryButton.addEventListener("click", () => {
      blankScreen.classList.add("hidden");
      customCssSpace.innerHTML = "";
  
      setTimeout(() => {
        thoughtsInput.value = "";
        submitButton.disabled = true;
        inputTitle.classList.remove("fade-out");
        inputSection.classList.remove("fade-out");
        inputScreen.classList.remove("hidden");
      }, 300);
    });
  
    function showLoader() {
      customCssSpace.innerHTML = `
        <section class="container-loader">
          <aside class="loader">
            ${Array.from({ length: 15 }, (_, i) => 
              `<div style="--s: ${i}" class="aro"></div>`).join('')}
          </aside>
        </section>
      `;
    }
  
    // Optional: background color changer function
    window.changeGradient = (color1, color2) => {
      document.body.style.background = `linear-gradient(to bottom right, ${color1}, ${color2})`;
      return `Background gradient changed to ${color1} and ${color2}`;
    };
  });
  
