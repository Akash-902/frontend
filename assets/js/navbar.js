const menuToggle = document.getElementById('mobile-menu');
const sidebar = document.getElementById('sidebar');
const body = document.body;

// Toggle sidebar and animate hamburger menu
menuToggle.addEventListener('click', (event) => {
  sidebar.classList.toggle('show-sidebar');
  menuToggle.classList.toggle('toggle-active'); // Add animation class
  event.stopPropagation(); // Prevent the click from closing the sidebar immediately
});

// Close sidebar when clicking anywhere outside the sidebar
body.addEventListener('click', (event) => {
  if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
    sidebar.classList.remove('show-sidebar');
    menuToggle.classList.remove('toggle-active'); // Remove animation class when closing
  }
});

// Prevent closing sidebar when clicking inside it
sidebar.addEventListener('click', (event) => {
  event.stopPropagation();
});


const button = document.getElementById('searchanime');
button.addEventListener('click', function() {
  window.location.href = "search.html";
})
