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

  const notesScreen = document.getElementById("notesScreen");
  const viewNotesBtn = document.getElementById("viewNotesBtn");
  const backToInputButton = document.getElementById("backToInputButton");
  const notesList = document.getElementById("notesList");
  
  const newEntryButton = document.getElementById("newEntryButton");

  thoughtsInput.addEventListener("input", () => {
      submitButton.disabled = !thoughtsInput.value.trim();
  });

 submitButton.addEventListener("click", async () => {
    const thoughts = thoughtsInput.value.trim();
    if (thoughts) {
        submitButton.disabled = true;

        // Save to local storage
        const noteObj = {
            text: thoughts,
            timestamp: new Date().toLocaleString()
        };
        const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
        savedNotes.push(noteObj);
        localStorage.setItem("moodNotes", JSON.stringify(savedNotes));

        try {
            // Send the text to the sentiment analysis API
            const response = await fetch('http://localhost:5001/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: thoughts })
            });
          
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();

            // Smooth transition to new background color
            document.body.style.background = `linear-gradient(to bottom right, ${result.color}, #e8eaf6)`;

            // Show the breathing prompt
            breathingPrompt.classList.remove("hidden");
        } catch (error) {
            console.error("Error analyzing sentiment:", error);
            // Fallback with smooth transition
            document.body.style.background = `linear-gradient(to bottom right, #808080, #e8eaf6)`;
            breathingPrompt.classList.remove("hidden");
        }
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
    inputScreen.classList.add("hidden"); // Hide input screen
    finalScreen.classList.remove("hidden"); // Show final screen
  });
  
// View Notes button
viewNotesBtn.addEventListener("click", () => {
    // Hide all other screens
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.add("hidden");
    });
    // Show notes screen
    notesScreen.classList.remove("hidden");
    loadNotes();
    // Hide the view entries button
    viewNotesBtn.classList.add("hidden");
});

// Back button
backToInputButton.addEventListener("click", () => {
    notesScreen.classList.add("hidden");
    inputScreen.classList.remove("hidden");
    // Show the view entries button again
    viewNotesBtn.classList.remove("hidden");
});
  

  
  newEntryButton.addEventListener("click", () => {
    finalScreen.classList.add("hidden");
    inputScreen.classList.remove("hidden");
    thoughtsInput.value = "";
    submitButton.disabled = true;
    document.body.style.background = "linear-gradient(to bottom right, #e0f7fa, #e8eaf6)";
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

// Load and display saved notes
function loadNotes() {
  notesList.innerHTML = "";
  const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");

  if (savedNotes.length === 0) {
    notesList.innerHTML = "<p>No notes yet!</p>";
    return;
  }

  savedNotes.forEach((note, index) => {
    const noteEl = document.createElement("div");
    noteEl.className = "note-item";
    noteEl.innerHTML = `
      <div class="note-content" data-index="${index}">
        <p class="editable-text">${note.text}</p>
        <small>🕒 ${note.timestamp}</small>
      </div>
      <button class="delete-btn" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;
    notesList.appendChild(noteEl);

    // Add double-click event for editing
    const editableText = noteEl.querySelector('.editable-text');
    editableText.addEventListener('dblclick', () => {
      const currentText = editableText.textContent;
      const input = document.createElement('textarea');
      input.value = currentText;
      input.classList.add('edit-input');
      
      // Replace paragraph with textarea
      editableText.replaceWith(input);
      input.focus();
      
      // Handle save on blur or enter key
      input.addEventListener('blur', saveEdit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          input.blur();
        }
      });
    });
  });

  // Add delete button events
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', deleteNote);
  });
}

function saveEdit(e) {
  const input = e.target;
  const newText = input.value.trim();
  const noteItem = input.closest('.note-content');
  const index = noteItem.dataset.index;
  
  if (newText) {
    // Update in memory
    const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
    savedNotes[index].text = newText;
    localStorage.setItem("moodNotes", JSON.stringify(savedNotes));
    
    // Update in DOM
    const p = document.createElement('p');
    p.className = 'editable-text';
    p.textContent = newText;
    input.replaceWith(p);
    
    // Reattach event listener
    p.addEventListener('dblclick', () => {
      const currentText = p.textContent;
      const newInput = document.createElement('textarea');
      newInput.value = currentText;
      newInput.classList.add('edit-input');
      p.replaceWith(newInput);
      newInput.focus();
      newInput.addEventListener('blur', saveEdit);
    });
  } else {
    // If empty, revert to original text
    const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
    const originalText = savedNotes[index].text;
    const p = document.createElement('p');
    p.className = 'editable-text';
    p.textContent = originalText;
    input.replaceWith(p);
  }
}

function deleteNote(e) {
  const index = e.target.closest('.delete-btn').dataset.index;
  const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
  
  // Remove the note at the specified index
  savedNotes.splice(index, 1);
  localStorage.setItem("moodNotes", JSON.stringify(savedNotes));
  
  // Reload the notes list
  loadNotes();
}
