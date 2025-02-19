const popup = document.getElementById("popup");
const showPopupLink = document.getElementById("showPopup");
const confirmBtn = document.getElementById("confirmBtn");
const popupHeader = document.getElementById("popupHeader");

// Show the popup
showPopupLink.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent the default link behavior
    popup.style.display = "block";
});

// Close the popup
const closePopup = () => {
    popup.style.display = "none";
};

confirmBtn.addEventListener("click", closePopup);

// Make the popup draggable
let isDragging = false;
let offsetX, offsetY;

popupHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        popup.style.left = `${e.pageX - offsetX}px`;
        popup.style.top = `${e.pageY - offsetY}px`;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});
