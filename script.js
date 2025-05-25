function showMessage(message, duration = 1000) {
	const status = document.getElementById("status-message");
	status.textContent = message;
	status.style.display = "block";

	// Hide the message after a few seconds
	status.classList.remove("hidden");
	setTimeout(() => {
		status.classList.add("hidden");
	}, duration);
}

// Load saved stories on page load
window.addEventListener("DOMContentLoaded", () => {
  fetch("/stories")
    .then(response => response.json())
    .then(savedStories => {
      const storyList = document.getElementById("story-list");

      savedStories.forEach(({ text, time }, i) => {
        addStoryToList(text, new Date(time), savedStories.length - i);
      });

      if (savedStories.length > 0) {
        storyList.style.display = "block";
      }
    })
    .catch(error => {
      console.error("Failed to load stories from server:", error);
    });
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Function to add story to the visible list
function addStoryToList(text, date, index, username) {
  const li = document.createElement("li");

  const numberSpan = document.createElement("span");
  numberSpan.className = "story-number";
  numberSpan.textContent = `${index}. `; // Show index number with dot

  const timestampSpan = document.createElement("span");
  timestampSpan.className = "timestamp";
  timestampSpan.textContent = date.toLocaleString();

  const userSpan = document.createElement("span");
  userSpan.className = "story-user";
  userSpan.textContent = ` — by ${username}`;

  li.appendChild(numberSpan);
  li.appendChild(document.createTextNode(escapeHtml(text) + " "));
  li.appendChild(timestampSpan);
  li.appendChild(userSpan);

  const storyList = document.getElementById("story-list");
  storyList.insertBefore(li, storyList.firstChild);
  storyList.style.display = "block";
}


// Handle form submission
document.getElementById("story-form").addEventListener("submit", function(event) {
  event.preventDefault();

  const storyText = document.getElementById("story").value.trim();
  const username = document.getElementById("username").value.trim() || "Anonymous";

  if (storyText === "") {
    showMessage("Story cannot be empty!");
    return;
  }
  if (storyText.length > 5000) {
    showMessage("Story is too long! Max 5000 characters.");
    return;
  }

  const now = new Date();

  // POST the story to the server
  fetch("/stories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: storyText,
      user: username,
      time: now.toISOString()
    })
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to save story");
    return response.json(); // assuming the server responds with the saved story
  })
  .then(savedStory => {
    // Add the story to the list visually
    addStoryToList(savedStory.text, new Date(savedStory.time), null, savedStory.user);
    document.getElementById("story-form").reset();
    document.getElementById("username").value = "";
    showMessage("Story submitted!");
  })
  .catch(error => {
    console.error("Error submitting story:", error);
    showMessage("Failed to submit story. Please try again.");
  });
});


document.getElementById("clear-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all stories?")) {
    localStorage.removeItem("stories");
    document.getElementById("story-list").innerHTML = "";
    document.getElementById("story-list").style.display = "none";
    showMessage("All stories cleared.");
  }
});
