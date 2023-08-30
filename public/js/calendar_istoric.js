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

});
