// calculator.js
document.addEventListener('DOMContentLoaded', function () {
    // Get references to form elements
    const inaltimeInput = document.getElementById('inaltime');
    const varstaInput = document.getElementById('varsta');
    const greutateInput = document.getElementById('greutate');
    const categorySelect = document.getElementById('category');
    const submitButton = document.getElementById('submitButton');

    // Function to check if all required fields are filled
    function checkFields() {
        const inaltimeValue = inaltimeInput.value.trim();
        const varstaValue = varstaInput.value.trim();
        const greutateValue = greutateInput.value.trim();
        const categoryValue = categorySelect.value;

        if (inaltimeValue !== '' && varstaValue !== '' && greutateValue !== '' && categoryValue !== '') {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    // Add event listeners to the input fields and select element
    inaltimeInput.addEventListener('input', checkFields);
    varstaInput.addEventListener('input', checkFields);
    greutateInput.addEventListener('input', checkFields);
    categorySelect.addEventListener('change', checkFields);

    // Add event listener to the submit button
    submitButton.addEventListener('click', function () {
        // Get the values from the form
        const inaltime = inaltimeInput.value.trim();
        const varsta = varstaInput.value.trim();
        const greutate = greutateInput.value.trim();
        const category = categorySelect.value;

        // Perform your data submission or processing here
        // You can send the data to a server using AJAX or fetch

        // For example, displaying the data in an alert for demonstration purposes
        alert(`Inaltime: ${inaltime}\nVarsta: ${varsta}\nGreutate: ${greutate}\nCategory: ${category}`);

        // Reset the form and disable the button
        document.getElementById('productForm').reset();
        submitButton.disabled = true;
    });
});
