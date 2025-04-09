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

    // ✅ KEEP THIS AS YOUR ONLY SUBMIT LISTENER ✅
submitButton.addEventListener("click", async () => {
    const thoughts = thoughtsInput.value.trim();
    if (thoughts) {
        submitButton.disabled = true;
        
        // 1. Prepare note object (will add mood data later)
        const noteObj = {
            text: thoughts,
            timestamp: new Date().toLocaleString(),
            mood: "unknown", // Default value
            color: "#e8eaf6" // Default gradient color
        };

        try {
            // 2. Call sentiment API
            const response = await fetch('https://replit.com/@aarushmathadam/sentiment#main.py', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: thoughts })
            });
            
            const result = await response.json();
            
            // 3. Update UI and note data with API results
            document.body.style.background = `linear-gradient(to bottom right, ${result.color}, #e8eaf6)`;
            noteObj.mood = result.mood || "unknown"; // Save mood if available
            noteObj.color = result.color || "#e8eaf6";

        } catch (error) {
            console.error("API Error:", error);
            // (Note: We'll still save the note without mood data)
        }

        // 4. Save note (works for both success/error cases)
        const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
        savedNotes.push(noteObj);
        localStorage.setItem("moodNotes", JSON.stringify(savedNotes));

        // 5. Show breathing prompt
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
    });
    
    // Back button
    backToInputButton.addEventListener("click", () => {
        notesScreen.classList.add("hidden");
        inputScreen.classList.remove("hidden");
    });
    
    // Modify their existing submit handler to SAVE NOTES
    

    newEntryButton.addEventListener("click", () => {
        finalScreen.classList.add("hidden");
        inputScreen.classList.remove("hidden");
        thoughtsInput.value = ""; // Clear previous entry
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
  
    savedNotes.forEach(note => {
      const noteEl = document.createElement("div");
      noteEl.className = "note-item";
      noteEl.innerHTML = `
        <p>${note.text}</p>
        <small>🕒 ${note.timestamp}</small>
      `;
      notesList.appendChild(noteEl);
    });
  }
