// Updated main.js with all three changes

document.addEventListener("DOMContentLoaded", () => {
  const inputScreen = document.getElementById("inputScreen")
  const breathingScreen = document.getElementById("breathingScreen")
  const finalScreen = document.getElementById("finalScreen")
  const trendsScreen = document.getElementById("trendsScreen")

  const thoughtsInput = document.getElementById("thoughtsInput")
  const submitButton = document.getElementById("submitButton")
  const breathingPrompt = document.getElementById("breathingPrompt")
  const yesBreathing = document.getElementById("yesBreathing")
  const noBreathing = document.getElementById("noBreathing")

  const breathingText = document.getElementById("breathingText")
  const breathingCircle = document.getElementById("breathingCircle")

  const notesScreen = document.getElementById("notesScreen")
  const viewNotesBtn = document.getElementById("viewNotesBtn")
  const viewTrendsBtn = document.getElementById("viewTrendsBtn")
  const backToInputButton = document.getElementById("backToInputButton")
  const backFromTrendsButton = document.getElementById("backFromTrendsButton")
  const notesList = document.getElementById("notesList")

  const backgroundOverlay = document.getElementById("backgroundOverlay")

  const newEntryButton = document.getElementById("newEntryButton")

  
  let moodTimeChart = null
  let moodDistributionChart = null

  thoughtsInput.addEventListener("input", () => {
    submitButton.disabled = !thoughtsInput.value.trim()
  })

  submitButton.addEventListener("click", async () => {
    const thoughts = thoughtsInput.value.trim()
    if (thoughts) {
      submitButton.disabled = true

      try {
        
        const response = await fetch("http://localhost:5001/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: thoughts }),
        })

        if (!response.ok) throw new Error("Network response was not ok")
        const result = await response.json()
      
        
        const noteObj = {
          text: thoughts,
          timestamp: new Date().toLocaleString(),
          date: new Date().toISOString(),
          sentiment: result.score,
          mood: result.mood,
          color: result.color
        }
        
        const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]")
        savedNotes.push(noteObj)
        localStorage.setItem("moodNotes", JSON.stringify(savedNotes))

        
        fadeBackgroundColor(result.color)

        
        showBreathingPromptBasedOnMood(result.mood, result.score)
        
      } catch (error) {
        console.error("Error analyzing sentiment:", error)

        fadeBackgroundColor("#808080")

        const noteObj = {
          text: thoughts,
          timestamp: new Date().toLocaleString(),
          date: new Date().toISOString(),
          sentiment: 0,
          mood: "Neutral",
          color: "#808080"
        }
        
        const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]")
        savedNotes.push(noteObj)
        localStorage.setItem("moodNotes", JSON.stringify(savedNotes))
        
        showBreathingPromptBasedOnMood("Neutral", 0)
      }
    }
  })
  
  function showBreathingPromptBasedOnMood(mood, score) {
    const promptMessage = breathingPrompt.querySelector("p");
    const needsBreathing = ["tired", "anxious", "sad", "angry", "very negative"].includes(mood.toLowerCase()) || score < -0.6;
    
    if (needsBreathing) {
      promptMessage.textContent = "Sorry to hear you're not doing well today. It is recommended that you first do some breathing exercises.";
    } else {
      promptMessage.textContent = "Glad to hear you're doing fine today! Would you still like to do some breathing exercises?";
    }
    
    
    let buttonContainer = breathingPrompt.querySelector(".button-container");
    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
      
      
      buttonContainer.appendChild(yesBreathing);
      buttonContainer.appendChild(noBreathing);
      breathingPrompt.appendChild(buttonContainer);
    }
    
    // First show the element but keep it invisible with CSS opacity
    breathingPrompt.classList.remove("hidden");
    
    // Then trigger a reflow before adding the visible class to ensure the animation works
    void breathingPrompt.offsetWidth;
    
    // Add the visible class to fade in the prompt and buttons
    setTimeout(() => {
      breathingPrompt.classList.add("visible");
    }, 100);
  }

  yesBreathing.addEventListener("click", () => {
    // Fade out breathing prompt first
    breathingPrompt.classList.remove("visible");
    
    // Wait for fade out to complete before hiding and showing the next screen
    setTimeout(() => {
      breathingPrompt.classList.add("hidden");
      inputScreen.classList.add("hidden");
      breathingScreen.classList.remove("hidden");
      startBreathingCycle();
    }, 500); // Half the fade time
  });

  noBreathing.addEventListener("click", () => {
    // Fade out breathing prompt first
    breathingPrompt.classList.remove("visible");
    
    // Wait for fade out to complete before hiding and showing the next screen
    setTimeout(() => {
      breathingPrompt.classList.add("hidden");
      inputScreen.classList.add("hidden"); // Hide input screen
      finalScreen.classList.remove("hidden"); // Show final screen
    }, 500); // Half the fade time
  });

  // View Notes button
  viewNotesBtn.addEventListener("click", () => {
    // Hide all other screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.add("hidden")
    })
    // Show notes screen
    notesScreen.classList.remove("hidden")
    loadNotes()
    // Update button visibility - hide Notes button, keep Trends button
    viewNotesBtn.classList.add("hidden")
    viewTrendsBtn.classList.remove("hidden")
  })
  
  // View Trends button
  viewTrendsBtn.addEventListener("click", () => {
    // Hide all other screens
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.add("hidden")
    })
    // Show trends screen
    trendsScreen.classList.remove("hidden")
    generateTrends()
    // Update button visibility - hide Trends button, keep Notes button
    viewTrendsBtn.classList.add("hidden")
    viewNotesBtn.classList.remove("hidden")
  })

  // Back button from notes
  backToInputButton.addEventListener("click", () => {
    notesScreen.classList.add("hidden")
    inputScreen.classList.remove("hidden")
    // Show both buttons again
    viewNotesBtn.classList.remove("hidden")
    viewTrendsBtn.classList.remove("hidden")
  })
  
  // Back button from trends
  backFromTrendsButton.addEventListener("click", () => {
    trendsScreen.classList.add("hidden")
    inputScreen.classList.remove("hidden")
    // Show both buttons again
    viewNotesBtn.classList.remove("hidden")
    viewTrendsBtn.classList.remove("hidden")
  })

  newEntryButton.addEventListener("click", () => {
    finalScreen.classList.add("hidden")
    inputScreen.classList.remove("hidden")
    thoughtsInput.value = ""
    submitButton.disabled = true
    fadeBackgroundColor("#e0f7fa") // Reset to default color
  })

  function startBreathingCycle() {
    const breathingCircle = document.getElementById("breathingCircle");
    let isInhale = true;
    let cycle = 0;
    const totalCycles = 10; // 10 inhale + 10 exhale = 60s
  
    const interval = setInterval(() => {
      breathingText.style.opacity = 0;
  
      setTimeout(() => {
        breathingText.textContent = isInhale ? "Breathe in" : "Breathe out";
        breathingText.style.opacity = 1;
  
        // Instead of moving a ball, scale the circle
        if (isInhale) {
          breathingCircle.style.transform = "scale(1.8)"; // Enlarge
          breathingCircle.style.boxShadow = "0 0 30px rgba(57, 73, 171, 0.8)";
        } else {
          breathingCircle.style.transform = "scale(1)"; // Shrink
          breathingCircle.style.boxShadow = "0 0 15px rgba(57, 73, 171, 0.5)";
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
  
  // Function to generate and display trends
  function generateTrends() {
    const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
    
    if (savedNotes.length === 0) {
      document.getElementById("mostCommonMood").textContent = "No data";
      document.getElementById("averageSentiment").textContent = "No data";
      document.getElementById("totalEntries").textContent = "0";
      return;
    }
    
    // Calculate stats
    const moodCounts = {};
    let totalSentiment = 0;
    
    savedNotes.forEach(note => {
      const mood = note.mood || "Neutral";
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      totalSentiment += parseFloat(note.sentiment || 0);
    });
    
    // Find most common mood
    const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
      moodCounts[a] > moodCounts[b] ? a : b);
    
    // Calculate average sentiment
    const avgSentiment = (totalSentiment / savedNotes.length).toFixed(2);
    
    // Update stats display
    document.getElementById("mostCommonMood").textContent = mostCommonMood;
    document.getElementById("averageSentiment").textContent = avgSentiment;
    document.getElementById("totalEntries").textContent = savedNotes.length;
    
    // Prepare data for charts
    const processedData = processDataForCharts(savedNotes);
    
    // Create charts
    createMoodTimeChart(processedData.timeData);
    createMoodDistributionChart(processedData.distributionData);
  }
  
  // Process data for charts
  function processDataForCharts(notes) {
    // For time chart (last 10 entries)
    const recentNotes = [...notes].slice(-10);
    const timeData = {
      labels: recentNotes.map(note => {
        const date = new Date(note.date || Date.parse(note.timestamp));
        return date.toLocaleDateString();
      }),
      datasets: [{
        label: 'Sentiment Score',
        data: recentNotes.map(note => parseFloat(note.sentiment || 0)),
        borderColor: '#3949ab',
        backgroundColor: 'rgba(57, 73, 171, 0.2)',
        fill: true,
        tension: 0.4
      }]
    };
    
    // For distribution chart
    const moodCounts = {};
    const moodColors = {};
    
    notes.forEach(note => {
      const mood = note.mood || "Neutral";
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      moodColors[mood] = note.color || "#808080";
    });
    
    const distributionData = {
      labels: Object.keys(moodCounts),
      datasets: [{
        data: Object.values(moodCounts),
        backgroundColor: Object.keys(moodCounts).map(mood => moodColors[mood]),
        borderWidth: 1
      }]
    };
    
    return { timeData, distributionData };
  }
  
  // Create mood over time chart
  function createMoodTimeChart(data) {
    const ctx = document.getElementById('moodTimeChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (moodTimeChart) {
      moodTimeChart.destroy();
    }
    
    moodTimeChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            min: -1,
            max: 1,
            ticks: {
              callback: function(value) {
                if (value === -1) return "Negative";
                if (value === 0) return "Neutral";
                if (value === 1) return "Positive";
                return "";
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Your Mood Over Time'
          }
        }
      }
    });
  }
  
  // Create mood distribution chart
  function createMoodDistributionChart(data) {
    const ctx = document.getElementById('moodDistributionChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (moodDistributionChart) {
      moodDistributionChart.destroy();
    }
    
    moodDistributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Mood Distribution'
          }
        }
      }
    });
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
    
    // Apply mood-based background color to each note
    noteEl.style.backgroundColor = note.color || "#e0e0e0";
    
    // For better text readability on dark backgrounds
    const isDarkColor = note.color && ["#062f57", "#696969"].includes(note.color);
    if (isDarkColor) {
      noteEl.style.color = "#ffffff";
    }
    
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

function saveEdit(e, index) {
  const input = e.target;
  const newText = input.value.trim();
  const noteItem = input.closest(".note-content");

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
      newInput.addEventListener("blur", () => {
        saveEdit({ target: newInput }, index);
      });
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
