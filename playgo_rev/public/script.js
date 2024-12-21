document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("grid");

  // Membuat grid 4x4 (16 items)
  for (let i = 0; i < 16; i++) {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";
    gridItem.textContent = i + 1;
    gridItem.addEventListener("click", () => {
      alert(`Grid item ${i + 1} clicked!`);
    });
    grid.appendChild(gridItem);
  }

  // Event listener untuk tombol PASS dan RESIGN
  const passButton = document.getElementById("passButton");
  const resignButton = document.getElementById("resignButton");

  passButton.addEventListener("click", () => {
    alert("PASS button clicked!");
  });

  resignButton.addEventListener("click", () => {
    alert("RESIGN button clicked!");
  });
});
