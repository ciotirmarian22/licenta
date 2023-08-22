// calendar.js

// Get references to the HTML elements
const dataInput = document.getElementById("data");
const addEventButton = document.getElementById("addEventButton");

// Initialize the selectedDate variable
let selectedDate = "";

// Add event listener to the button
addEventButton.addEventListener("click", function () {
    // Get the selected date from the input element
    const selectedDate = dataInput.value;

    // Use the selected date in your JavaScript code
    console.log("Selected Date:", selectedDate);

    fetch('/save-selected-date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedDate })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server response:", data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
});


