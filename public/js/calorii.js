// calorii.js

document.addEventListener("DOMContentLoaded", function () {
    const addToDatabaseButton = document.getElementById("addToDatabaseButton");
    const eventTextInput = document.getElementById("eventText"); // Numeric input element
    const selectedProductNameElement = document.getElementById("selectedProductName");

    if (addToDatabaseButton && eventTextInput && selectedProductNameElement) {
        // Add input event listener to the numeric input
        eventTextInput.addEventListener("input", function () {
            const eventText = eventTextInput.value;
            const isNumberGreaterThanZero = parseInt(eventText) > 0;

            // Enable/disable the button based on both conditions
            addToDatabaseButton.disabled = !(isNumberGreaterThanZero && selectedProductNameElement.textContent !== "");

            console.log("isNumberGreaterThanZero:", isNumberGreaterThanZero);
        });

        // Add click event listener to the dynamic search results
        const searchResults = document.querySelectorAll(".search-result-item");
        searchResults.forEach(result => {
            result.addEventListener("click", function () {
                const selectedProductName = result.textContent;

                // Enable/disable the button based on both conditions
                addToDatabaseButton.disabled = !(parseInt(eventTextInput.value) > 0 && selectedProductName !== "");
                selectedProductNameElement.textContent = selectedProductName; // Update selected product name display
            });
        });
    }
});
