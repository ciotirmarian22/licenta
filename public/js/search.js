function handleSearch(produse, searchBar) {
    searchBar.addEventListener("input", function () {
        const searchTerm = searchBar.value.trim().toLowerCase();
        
        // Clear previous search results
        searchResults.innerHTML = "";
        
        // Filter products based on the search term
        const filteredProducts = produse.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );

        // Display search results
        filteredProducts.forEach(product => {
            const listItem = document.createElement("li");
            listItem.textContent = `${product.name} - ${product.pret}`;
            
            // Add click event listener to capture selection
            listItem.addEventListener("click", function () {
                console.log("Selected product:", product);
            });

            searchResults.appendChild(listItem);
        });
    });
}


// Get references to the HTML elements
const searchBar = document.getElementById("searchBar");
const searchResults = document.getElementById("searchResults");

// Call the function with the products array and searchBar element
handleSearch(produse, searchBar);
// Add event listener to the search bar
searchBar.addEventListener("input", function () {
    const searchTerm = searchBar.value.trim().toLowerCase();
    
    // Clear previous search results
    searchResults.innerHTML = "";
    
    // Filter products based on the search term
    const filteredProducts = produse.filter(produse =>
        produse.name.toLowerCase().includes(searchTerm)
    );

    // Display search results
    filteredProducts.forEach(produse => {
        const listItem = document.createElement("li");
        listItem.textContent = `${produse.name} - ${produse.pret}`;
        searchResults.appendChild(listItem);
    });
});