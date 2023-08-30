// Get references to the HTML elements
const dataInput = document.getElementById("data2");
const addEventButton = document.getElementById("addEventButton2");

// Add event listener to the button
addEventButton.addEventListener("click", function () {
    // Get the selected date from the input element
    const selectedDate = dataInput.value;

    // Use the selected date in your JavaScript code
    console.log("Selected Date:", selectedDate);

    window.location.href = `/istoric?selectedDate=${selectedDate}`;

    fetch('/save-selected-date-2', {
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
