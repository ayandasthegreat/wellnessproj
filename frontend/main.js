document.addEventListener("DOMContentLoaded", () => {
  const inputScreen = document.getElementById("inputScreen")
  const breathingScreen = document.getElementById("breathingScreen")
  const finalScreen = document.getElementById("finalScreen")

  const thoughtsInput = document.getElementById("thoughtsInput")
  const submitButton = document.getElementById("submitButton")
  const breathingPrompt = document.getElementById("breathingPrompt")
  const yesBreathing = document.getElementById("yesBreathing")
  const noBreathing = document.getElementById("noBreathing")

  const breathingText = document.getElementById("breathingText")
  const breathingBall = document.getElementById("breathingBall")
  const lineTrack = document.querySelector(".line-track")

  const notesScreen = document.getElementById("notesScreen")
  const viewNotesBtn = document.getElementById("viewNotesBtn")
  const backToInputButton = document.getElementById("backToInputButton")
  const notesList = document.getElementById("notesList")

  const backgroundOverlay = document.getElementById("backgroundOverlay")

  const newEntryButton = document.getElementById("newEntryButton")

  thoughtsInput.addEventListener("input", () => {
    submitButton.disabled = !thoughtsInput.value.trim()
  })

  submitButton.addEventListener("click", async () => {
    const thoughts = thoughtsInput.value.trim()
    if (thoughts) {
      submitButton.disabled = true

      // Save to local storage
      const noteObj = {
        text: thoughts,
        timestamp: new Date().toLocaleString(),
      }
      const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]")
      savedNotes.push(noteObj)
      localStorage.setItem("moodNotes", JSON.stringify(savedNotes))

      try {
        // Send the text to the sentiment analysis API
        const response = await fetch("http://localhost:5001/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: thoughts }),
        })

        if (!response.ok) throw new Error("Network response was not ok")
        const result = await response.json()

        // Smooth transition to new background color
        fadeBackgroundColor(result.color)

        // Show the breathing prompt
        breathingPrompt.classList.remove("hidden")
      } catch (error) {
        console.error("Error analyzing sentiment:", error)
        // Fallback with smooth transition
        fadeBackgroundColor("#808080")
        breathingPrompt.classList.remove("hidden")
      }
    }
  })

  yesBreathing.addEventListener("click", () => {
    inputScreen.classList.add("hidden")
    breathingScreen.classList.remove("hidden")
    breathingPrompt.classList.add("hidden")
    startBreathingCycle()
  })

  noBreathing.addEventListener("click", () => {
    breathingPrompt.classList.add("hidden")
    inputScreen.classList.add("hidden") // Hide input screen
    finalScreen.classList.remove("hidden") // Show final screen
  })

  // View Notes button
  viewNotesBtn.addEventListener("click", () => {
    // Hide all other screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.add("hidden")
    })
    // Show notes screen
    notesScreen.classList.remove("hidden")
    loadNotes()
    // Hide the view entries button
    viewNotesBtn.classList.add("hidden")
  })

  // Back button
  backToInputButton.addEventListener("click", () => {
    notesScreen.classList.add("hidden")
    inputScreen.classList.remove("hidden")
    // Show the view entries button again
    viewNotesBtn.classList.remove("hidden")
  })

  newEntryButton.addEventListener("click", () => {
    finalScreen.classList.add("hidden")
    inputScreen.classList.remove("hidden")
    thoughtsInput.value = ""
    submitButton.disabled = true
    fadeBackgroundColor("#e0f7fa") // Reset to default color
  })

  function startBreathingCycle() {
    let isInhale = true;
    let cycle = 0;
    const totalCycles = 10; // 10 inhale + 10 exhale = 60s
  
    const interval = setInterval(() => {
      breathingText.style.opacity = 0;
  
      setTimeout(() => {
        breathingText.textContent = isInhale ? "Breathe in" : "Breathe out";
        breathingText.style.opacity = 1;
  
        // Get the height of the line track and the ball
        const trackHeight = lineTrack.offsetHeight;
        const ballHeight = breathingBall.offsetHeight;

        // Set the transition duration
        breathingBall.style.transition = "top 3s ease-in-out";
        
        // On inhale, move the ball to the top (0px), on exhale, move it to the bottom (trackHeight - ballHeight)
        if (isInhale) {
          breathingBall.style.top = `0px`; // Inhale: Move the ball to the top of the track
        } else {
          breathingBall.style.top = `${trackHeight - ballHeight}px`; // Exhale: Move the ball to the bottom of the track
        }
  
        isInhale = !isInhale;
        cycle++;
        if (cycle >= totalCycles * 2) {
          clearInterval(interval);
          setTimeout(() => {
            breathingScreen.classList.add("hidden");
            finalScreen.classList.remove("hidden");
          }, 3000);
        }
      }, 1000); // fade delay
    }, 6000);
}
  // New function for smooth background color transitions
  function fadeBackgroundColor(newColor) {
    // Set the new background color on the overlay
    backgroundOverlay.style.background = `linear-gradient(to bottom right, ${newColor}, #e8eaf6)`

    // Fade in the overlay
    backgroundOverlay.style.opacity = "1"

    // After the transition completes, set the body background to the new color
    // and reset the overlay opacity for future transitions
    setTimeout(() => {
      document.body.style.background = `linear-gradient(to bottom right, ${newColor}, #e8eaf6)`
      backgroundOverlay.style.opacity = "0"
    }, 2000) // Match this to the transition duration in CSS

    console.log(`Transitioning background to color: ${newColor}`)
  }
})

// Load and display saved notes
function loadNotes() {
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";
  const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");

  if (savedNotes.length === 0) {
    notesList.innerHTML = "<p>No notes yet!</p>";
    return;
  }

  savedNotes.forEach((note, index) => {
    const noteEl = document.createElement("div");
    // Add random tilt class (1-5)
    const tiltClass = `tilt-${Math.floor(Math.random() * 5) + 1}`;
    noteEl.className = `note-item ${tiltClass}`;
    
    noteEl.innerHTML = `
      <div class="note-content" data-index="${index}">
        ${note.text}
      </div>
      <div class="note-footer">
        <small>${note.timestamp}</small>
        <button class="delete-btn" data-index="${index}" aria-label="Delete note">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    notesList.appendChild(noteEl);

    // Rest of your editing functionality...
    const noteContent = noteEl.querySelector(".note-content");
    noteContent.addEventListener("dblclick", () => {
      const currentText = noteContent.textContent.trim();
      const input = document.createElement("textarea");
      input.value = currentText;
      input.style.fontFamily = "'Caveat', cursive";
      input.style.fontSize = "1.3rem";
      input.style.width = "100%";
      input.style.minHeight = "120px";
      input.style.padding = "0.5rem";
      input.style.border = "1px dashed rgba(0,0,0,0.2)";
      input.style.borderRadius = "3px";
      input.style.background = "transparent";
      
      noteContent.innerHTML = "";
      noteContent.appendChild(input);
      input.focus();

      input.addEventListener("blur", () => {
        saveEdit({ target: input }, index);
      });
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", deleteNote);
  });
}


function saveEdit(e) {
  const input = e.target;
  const newText = input.value.trim();
  const noteItem = input.closest(".note-content");
  const index = noteItem.dataset.index;

  if (newText) {
    // Update in memory
    const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
    savedNotes[index].text = newText;
    localStorage.setItem("moodNotes", JSON.stringify(savedNotes));

    // Update in DOM - with Caveat font preserved
    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";
    contentDiv.dataset.index = index;
    contentDiv.style.fontFamily = "'Caveat', cursive";
    contentDiv.style.fontSize = "1.3rem";
    contentDiv.textContent = newText;
    
    // Replace the textarea with our styled div
    input.replaceWith(contentDiv);

    // Reattach event listener
    contentDiv.addEventListener("dblclick", () => {
      const currentText = contentDiv.textContent.trim();
      const newInput = document.createElement("textarea");
      newInput.value = currentText;
      newInput.style.fontFamily = "'Caveat', cursive";
      newInput.style.fontSize = "1.3rem";
      newInput.style.width = "100%";
      newInput.style.minHeight = "120px";
      newInput.style.padding = "0.5rem";
      newInput.style.border = "1px dashed rgba(0,0,0,0.2)";
      newInput.style.borderRadius = "3px";
      newInput.style.background = "transparent";
      
      contentDiv.replaceWith(newInput);
      newInput.focus();
      newInput.addEventListener("blur", saveEdit);
    });
  } else {
    // If empty, revert to original text with Caveat font
    const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
    const originalText = savedNotes[index].text;
    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";
    contentDiv.dataset.index = index;
    contentDiv.style.fontFamily = "'Caveat', cursive";
    contentDiv.style.fontSize = "1.3rem";
    contentDiv.textContent = originalText;
    input.replaceWith(contentDiv);
  }
}

function deleteNote(e) {
  const index = e.target.closest(".delete-btn").dataset.index
  const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]")

  savedNotes.splice(index, 1)
  localStorage.setItem("moodNotes", JSON.stringify(savedNotes))

  // Reload the notes list
  loadNotes()
}
