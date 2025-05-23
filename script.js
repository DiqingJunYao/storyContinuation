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
  const savedStories = JSON.parse(localStorage.getItem("stories")) || [];
  const storyList = document.getElementById("story-list");

  savedStories.forEach(({ text, time }, i) => {
    addStoryToList(text, new Date(time), savedStories.length - i);
  });

  if (savedStories.length > 0) {
    storyList.style.display = "block";
  }
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
    showMessage("Story is too long! Max 500 characters.");
    return;
  }

  const now = new Date();

  // Save story to localStorage
  const savedStories = JSON.parse(localStorage.getItem("stories")) || [];
  savedStories.unshift({
    text: storyText,
    time: now.toISOString(),
    user: username
  }); // newest first

  localStorage.setItem("stories", JSON.stringify(savedStories));

  addStoryToList(storyText, now, savedStories.length, username);

  document.getElementById("story-form").reset();

  document.getElementById("username").value = "";

  showMessage("Story submitted!");
});

document.getElementById("story-form").addEventListener("reset", function() {
	showMessage("Story submitted!");
});

document.getElementById("clear-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all stories?")) {
    localStorage.removeItem("stories");
    document.getElementById("story-list").innerHTML = "";
    document.getElementById("story-list").style.display = "none";
    showMessage("All stories cleared.");
  }
});
