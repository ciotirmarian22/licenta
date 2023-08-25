// calorii.js

document.addEventListener("DOMContentLoaded", function () {
    const addTextButton = document.getElementById("addTextButton");

    if (addTextButton) {
        addTextButton.addEventListener("click", function () {
            const eventText = document.getElementById("eventText").value;
            console.log("Event Text:", eventText);

            // Send the eventText value to the server
            fetch('/add-event-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventText })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Server response:", data);
            })
            .catch(error => {
                console.error("Error:", error);
            });
        });
    }
});
