document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const inputScreen = document.getElementById("inputScreen")
    const blankScreen = document.getElementById("blankScreen")
    const inputTitle = document.getElementById("inputTitle")
    const inputSection = document.getElementById("inputSection")
    const thoughtsInput = document.getElementById("thoughtsInput")
    const submitButton = document.getElementById("submitButton")
    const newEntryButton = document.getElementById("newEntryButton")
    const customCssSpace = document.getElementById("customCssSpace")
  
    // Enable/disable submit button based on input
    thoughtsInput.addEventListener("input", () => {
      submitButton.disabled = !thoughtsInput.value.trim()
    })
  
    // Handle form submission
    submitButton.addEventListener("click", () => {
      const thoughts = thoughtsInput.value.trim()
      if (thoughts) {
        // Fade out the input elements
        inputTitle.classList.add("fade-out")
        inputSection.classList.add("fade-out")
  
        // Wait for fade out to complete before showing blank screen
        setTimeout(() => {
          // Hide input screen and show blank screen
          inputScreen.classList.add("hidden")
          blankScreen.classList.remove("hidden")
  
          // Add a simple example CSS element to demonstrate the blank canvas
          addExampleCssElement(thoughts)
        }, 500) // 500ms for fade-out
      }
    })
  
    // Handle new entry button
    newEntryButton.addEventListener("click", () => {
      // Hide blank screen
      blankScreen.classList.add("hidden")
  
      // Clear the custom CSS space
      customCssSpace.innerHTML = ""
  
      // Reset the input screen
      setTimeout(() => {
        // Reset the input
        thoughtsInput.value = ""
        submitButton.disabled = true
  
        // Remove fade-out classes
        inputTitle.classList.remove("fade-out")
        inputSection.classList.remove("fade-out")
  
        // Show input screen
        inputScreen.classList.remove("hidden")
      }, 300) // Short delay before showing input screen again
    })
  
    // Function to add an example CSS element to the blank canvas
    function addExampleCssElement(thoughts) {
      // Clear any existing elements
      customCssSpace.innerHTML = ""
  
      // Create a container for the CSS demo
      const demoContainer = document.createElement("div")
      demoContainer.style.width = "100%"
      demoContainer.style.height = "100%"
      demoContainer.style.display = "flex"
      demoContainer.style.flexDirection = "column"
      demoContainer.style.alignItems = "center"
      demoContainer.style.justifyContent = "center"
      demoContainer.style.gap = "20px"
  
      // Add a title
      const title = document.createElement("h3")
      title.textContent = "CSS Animation Examples"
      title.style.color = "#3949ab"
  
      // Create floating circles
      const circlesContainer = document.createElement("div")
      circlesContainer.style.display = "flex"
      circlesContainer.style.gap = "20px"
  
      // Create 3 different animated elements
      const animations = [
        { color: "#ff9a9e", animation: "float 3s ease-in-out infinite" },
        { color: "#a18cd1", animation: "pulse 2s ease-in-out infinite" },
        { color: "#fad0c4", animation: "rotate 4s linear infinite" },
      ]
  
      animations.forEach(({ color, animation }) => {
        const circle = document.createElement("div")
        circle.style.width = "60px"
        circle.style.height = "60px"
        circle.style.backgroundColor = color
        circle.style.borderRadius = "50%"
        circle.style.animation = animation
        circlesContainer.appendChild(circle)
      })
  
      // Add the thought as hidden data
      const thoughtData = document.createElement("input")
      thoughtData.type = "hidden"
      thoughtData.value = thoughts
  
      // Assemble the demo
      demoContainer.appendChild(title)
      demoContainer.appendChild(circlesContainer)
      demoContainer.appendChild(thoughtData)
  
      // Add to the custom CSS space
      customCssSpace.appendChild(demoContainer)
    }
  })
  
