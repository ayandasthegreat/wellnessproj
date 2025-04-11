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
    const breathingBall = document.getElementById("breathingBall")
  
    const notesScreen = document.getElementById("notesScreen")
    const viewNotesBtn = document.getElementById("viewNotesBtn")
    const viewTrendsBtn = document.getElementById("viewTrendsBtn")
    const backToInputButton = document.getElementById("backToInputButton")
    const backFromTrendsButton = document.getElementById("backFromTrendsButton")
    const notesList = document.getElementById("notesList")
  
    const backgroundOverlay = document.getElementById("backgroundOverlay")
  
    const newEntryButton = document.getElementById("newEntryButton")
  
    
    let currentMoodData = {
      mood: "Neutral",
      score: 0,
      color: "#808080"
    };
    

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
        
          
          currentMoodData = {
            mood: result.mood,
            score: result.score,
            color: result.color
          };
          
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
  
          currentMoodData = {
            mood: "Neutral",
            score: 0,
            color: "#808080"
          };
  
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
      
    
      breathingPrompt.classList.remove("hidden");
      

      void breathingPrompt.offsetWidth;
      

      setTimeout(() => {
        breathingPrompt.classList.add("visible");
      }, 100);
    }
  
    yesBreathing.addEventListener("click", () => {
      breathingPrompt.classList.remove("visible");
      
      setTimeout(() => {
        breathingPrompt.classList.add("hidden");
        inputScreen.classList.add("hidden");
        breathingScreen.classList.remove("hidden");
        startBreathingCycle();
      }, 500);
    });
  
    noBreathing.addEventListener("click", () => {
      breathingPrompt.classList.remove("visible");
      
      setTimeout(() => {
        breathingPrompt.classList.add("hidden");
        inputScreen.classList.add("hidden"); 
        finalScreen.classList.remove("hidden"); 
        

        updateRecommendationsDisplay(currentMoodData);
      }, 500);
    });
  

    viewNotesBtn.addEventListener("click", () => {

      document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.add("hidden")
      })

      notesScreen.classList.remove("hidden")
      loadNotes()
 
      viewNotesBtn.classList.add("hidden")
      viewTrendsBtn.classList.remove("hidden")
    })
    
    
    viewTrendsBtn.addEventListener("click", () => {
  
      document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.add("hidden")
      })

      trendsScreen.classList.remove("hidden")
      generateTrends()

      viewTrendsBtn.classList.add("hidden")
      viewNotesBtn.classList.remove("hidden")
    })
  

    backToInputButton.addEventListener("click", () => {
      notesScreen.classList.add("hidden")
      inputScreen.classList.remove("hidden")

      viewNotesBtn.classList.remove("hidden")
      viewTrendsBtn.classList.remove("hidden")
    })
    
    
    backFromTrendsButton.addEventListener("click", () => {
      trendsScreen.classList.add("hidden")
      inputScreen.classList.remove("hidden")

      viewNotesBtn.classList.remove("hidden")
      viewTrendsBtn.classList.remove("hidden")
    })
  
    newEntryButton.addEventListener("click", () => {
      finalScreen.classList.add("hidden")
      inputScreen.classList.remove("hidden")
      thoughtsInput.value = ""
      submitButton.disabled = true
      fadeBackgroundColor("#e0f7fa")
    })
  
    function startBreathingCycle() {
        const breathingCircle = document.getElementById("breathingCircle");
        let isInhale = true;
        let cycle = 0;
        const totalCycles = 5;
        
 
        breathingText.textContent = "Breathe in";
        breathingText.style.opacity = 1;
        breathingCircle.style.transform = "scale(1)";
        
   
        setTimeout(() => {
          breathingCircle.style.transform = "scale(1.8)"; 
          breathingCircle.style.boxShadow = "0 0 30px rgba(57, 73, 171, 0.8)";
        }, 300); 
      
        const interval = setInterval(() => {
          breathingText.style.opacity = 0;
      
          setTimeout(() => {
            breathingText.textContent = isInhale ? "Breathe in" : "Breathe out";
            breathingText.style.opacity = 1;
      
            
            if (isInhale) {
              breathingCircle.style.transform = "scale(1.8)"; 
              breathingCircle.style.boxShadow = "0 0 30px rgba(57, 73, 171, 0.8)";
            } else {
              breathingCircle.style.transform = "scale(1)"; 
              breathingCircle.style.boxShadow = "0 0 15px rgba(57, 73, 171, 0.5)";
            }
      
            isInhale = !isInhale;
            cycle++;
            if (cycle >= totalCycles * 2) {
              clearInterval(interval);
              setTimeout(() => {
                breathingScreen.classList.add("hidden");
                finalScreen.classList.remove("hidden");
                updateRecommendationsDisplay(currentMoodData);
              }, 1500);
            }
          }, 500); 
        }, 4000);
      }
  
    function updateRecommendationsDisplay(moodData) {
      const recommendationsContainer = document.getElementById("recommendationsContainer");
      const moodTitle = document.getElementById("moodTitle");
      
      if (!recommendationsContainer || !moodTitle) return;
      

      const { title, description, recommendations } = getMoodRecommendations(moodData.mood);
      
 
      moodTitle.textContent = title;
      
     
      const moodDescription = document.getElementById("moodDescription");
      if (moodDescription) {
        moodDescription.textContent = description;
      }
      
   
      recommendationsContainer.innerHTML = "";
      
      
      recommendations.forEach(rec => {
        const recItem = document.createElement("div");
        recItem.className = "recommendation-item";
        
        recItem.innerHTML = `
          <div class="recommendation-bullet"></div>
          <div class="recommendation-text">${rec}</div>
        `;
        
        recommendationsContainer.appendChild(recItem);
      });
    }
    
    
    function getMoodRecommendations(mood) {
      const moodLower = mood.toLowerCase();
      
      switch(moodLower) {
        case "happy":
          return {
            title: "Happy",
            description: "It's always good to be happy! To keep it going:",
            recommendations: [
              "Practice gratitude to make the feeling last",
              "Document your joy: Tell people close to you or log it through writing",
              "Channel that energy into something creative or productive",
              "Note down what made you feel this way and keep it in mind"
            ]
          };
          
        case "content":
          return {
            title: "Content",
            description: "Feeling content is surprisingly healthy! To preserve it:",
            recommendations: [
              "Savor the moment—use your five senses",
              "Take a mindful walk or stretch gently",
              "Journal a few peaceful thoughts or memories",
              "Help others out when possible"
            ]
          };
          
        case "anxious":
          return {
            title: "Anxious",
            description: "Anxious behavior is bound to happen with all the stressors of today. To help manage it:",
            recommendations: [
              "Try box breathing: inhale 4 sec, hold 4, exhale 4, hold 4",
              "Ground yourself: name 5 things you can see, 4 you can hear, etc.",
              "Hold an ice cube or splash cold water on your face",
              "Listen to calming music or nature sounds",
              "Write your worries down—let your mind rest"
            ]
          };
          
        case "tired":
          return {
            title: "Tired",
            description: "It's understandable to be tired occasionally. To help relieve it:",
            recommendations: [
              "Power nap (15–30 min)",
              "Do a slow body scan meditation",
              "Hydrate or eat a small snack",
              "Step outside for fresh air and natural light",
              "Take things easy if possible, don't feel guilty for resting up"
            ]
          };
          
        case "sad":
          return {
            title: "Sad",
            description: "Feeling down is part of life, but it's not permanent. To help soothe:",
            recommendations: [
              "Cry if you need to—it's natural and helps you release the emotion",
              "Cuddle a pet or a pillow",
              "Match the mood with somber music",
              "Watch a comforting or uplifting video",
              "Write a letter to yourself with kindness"
            ]
          };
          
        case "angry":
          return {
            title: "Angry",
            description: "You can never see your reflection in boiling water. To help manage anger:",
            recommendations: [
              "Punch a pillow or scream into it",
              "Channel it through rigor: productive work, activity, or exercise",
              "Write an \"angry letter\" (you don't send)",
              "Cool down with cold water or a shower"
            ]
          };
          
        case "very negative":
          return {
            title: "Very Negative",
            description: "Life is a series of ups and downs, but here's what you can do to lift yourself up:",
            recommendations: [
              "Do one tiny task (make bed, brush teeth)",
              "Text someone—doesn't have to be deep",
              "Sit by a window or step outside",
              "Make sure to frame the situation. Will this situation last?",
              "Use positive self-talk, even if it feels weird"
            ]
          };
          
        default:
          return {
            title: "Neutral",
            description: "To Check In or Elevate:",
            recommendations: [
              "Ask yourself: \"What do I need right now?\"",
              "Try something sensory (candle, texture, music)",
              "Do something small that brings joy or curiosity",
              "Check in with your body—tension? hunger? boredom?",
              "Move gently—stretch, walk, or sway to music"
            ]
          };
      }
    }

    function fadeBackgroundColor(newColor) {

      backgroundOverlay.style.background = newColor
  

      backgroundOverlay.style.opacity = "1"
  
      setTimeout(() => {
        document.body.style.background = newColor
        backgroundOverlay.style.opacity = "0"
      }, 2000) 
  
      console.log(`Transitioning background to color: ${newColor}`)
    }
    
    
    function generateTrends() {
      const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
      
      if (savedNotes.length === 0) {
        document.getElementById("mostCommonMood").textContent = "No data";
        document.getElementById("averageSentiment").textContent = "No data";
        document.getElementById("totalEntries").textContent = "0";
        return;
      }
      
      
      const moodCounts = {};
      let totalSentiment = 0;
      
      savedNotes.forEach(note => {
        const mood = note.mood || "Neutral";
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
        totalSentiment += parseFloat(note.sentiment || 0);
      });
      
      
      const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b);
      
      
      const avgSentiment = (totalSentiment / savedNotes.length).toFixed(2);
      
      
      document.getElementById("mostCommonMood").textContent = mostCommonMood;
      document.getElementById("averageSentiment").textContent = avgSentiment;
      document.getElementById("totalEntries").textContent = savedNotes.length;
      
      
      const processedData = processDataForCharts(savedNotes);
      
      
      createMoodTimeChart(processedData.timeData);
      createMoodDistributionChart(processedData.distributionData);
    }
    
    
    function processDataForCharts(notes) {
      
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
    
    
    function createMoodTimeChart(data) {
      const ctx = document.getElementById('moodTimeChart').getContext('2d');
      
      
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
    
    
    function createMoodDistributionChart(data) {
      const ctx = document.getElementById('moodDistributionChart').getContext('2d');
      
      
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
  });
  
  
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
      
      const tiltClass = `tilt-${Math.floor(Math.random() * 5) + 1}`;
      noteEl.className = `note-item ${tiltClass}`;
      
      
      noteEl.style.backgroundColor = note.color || "#e0e0e0";
      
      
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
      
      const savedNotes = JSON.parse(localStorage.getItem("moodNotes") || "[]");
      savedNotes[index].text = newText;
      localStorage.setItem("moodNotes", JSON.stringify(savedNotes));
  
      
      const contentDiv = document.createElement("div");
      contentDiv.className = "note-content";
      contentDiv.dataset.index = index;
      contentDiv.style.fontFamily = "'Caveat', cursive";
      contentDiv.style.fontSize = "1.3rem";
      contentDiv.textContent = newText;
      
      
      input.replaceWith(contentDiv);
  
      
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
  
    
    loadNotes()
  }
