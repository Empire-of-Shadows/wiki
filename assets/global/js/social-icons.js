// Dynamically load the social-icons.html content
document.addEventListener("DOMContentLoaded", () => {
    fetch("/global/html/global-footer.html")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load social-icons.html");
            return response.text();
        })
        .then(html => {
            document.getElementById("social-icons-container").innerHTML = html;
        })
        .catch(error => console.error("Error loading social icons:", error));
});
