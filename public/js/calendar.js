// calendar.js

// Get references to the HTML elements
const dataInput = document.getElementById("data");
const addEventButton = document.getElementById("addEventButton");

// Add event listener to the button
addEventButton.addEventListener("click", function () {
    // Get the selected date from the input element
    const selectedDate = dataInput.value;

    // Use the selected date in your JavaScript code
    console.log("Selected Date:", selectedDate);

    // You can perform further actions or processing with the selected date here
});