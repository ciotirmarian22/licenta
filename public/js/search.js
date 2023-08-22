// search.js

// Define a function to handle the dynamic search
function handleSearch(produse, searchBar) {
    const searchResults = document.getElementById("searchResults");
    let selectedProduct = null;
    let addToDatabaseButton = document.getElementById("addToDatabaseButton");
    let selectedProductName = document.getElementById("selectedProductName");

    searchBar.addEventListener("input", function () {
        const searchTerm = searchBar.value.trim().toLowerCase();

        // Clear previous search results
        searchResults.innerHTML = "";

        // Filter produse based on the search term
        const filteredProducts = produse.filter(produs =>
            produs.name.toLowerCase().includes(searchTerm)
        );

        // Display search results
        filteredProducts.forEach(produs => {
            const listItem = document.createElement("li");
            listItem.textContent = `${produs.name} - ${produs.pret}`;

            // Add click event listener to capture selection
            listItem.addEventListener("click", function () {
                // Set the selected product
                selectedProduct = produs;

                // Remove the highlight from other items
                searchResults.querySelectorAll("li").forEach(item => {
                    if (item !== listItem) {
                        item.classList.remove("selected");
                    }
                });

                // Highlight the selected item
                listItem.classList.add("selected");

                // Enable the "Add to Database" button
                addToDatabaseButton.disabled = false;

                // Display the selected product name
                selectedProductName.textContent = `Selected: ${produs.name}`;
            });

            searchResults.appendChild(listItem);
        });
    });

    // Set up event listener for the "Add to Database" button
    addToDatabaseButton.addEventListener("click", function () {
        if (selectedProduct) {
            // Access the selected product's id and other details
            const selectedProductId = selectedProduct.id;
    
            // Here, you can send the selected product's id to the server to add it to the database
            // For example, using the Fetch API or XMLHttpRequest
    
            // Make an AJAX request to add the selected product's id to the database
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/add-to-masa1", true);
            xhr.setRequestHeader("Content-Type", "application/json");
    
            const data = {
                id: selectedProductId
            };
    
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        // Database operation successful
                        console.log("Product id added to masa1 field:", selectedProductId);
                    } else {
                        // Handle error
                        console.error("Error adding product id to masa1 field:", xhr.status);
                    }
                }
            };
    
            xhr.send(JSON.stringify(data));
        }
    });
}

// Get references to the HTML elements
const searchBar = document.getElementById("searchBar");
//const produse = <%- JSON.stringify(produse) %>;

// Call the function with the produse array and searchBar element
handleSearch(produse, searchBar);
