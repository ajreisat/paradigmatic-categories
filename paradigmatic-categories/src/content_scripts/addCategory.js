// addCategory.js

document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-button');
  const cancelButton = document.getElementById('cancel-button');
  const categoryNameInput = document.getElementById('category-name');

  addButton.addEventListener('click', () => {
    const categoryName = categoryNameInput.value.trim();
    if (validateCategoryName(categoryName)) {
      chrome.runtime.sendMessage({ action: 'createCategory', name: categoryName }, (response) => {
        if (response.status === 'success') {
          alert('Category added successfully.');
          closePanel();
          // Optionally, refresh the category list in the UI
        } else {
          alert(response.message || 'Failed to add category.');
        }
      });
    } else {
      alert('Invalid category name. Please ensure it is unique and within character limits.');
    }
  });

  cancelButton.addEventListener('click', () => {
    closePanel();
  });
});

function validateCategoryName(name) {
  const maxLength = 50;
  const regex = /^[a-zA-Z0-9\s\-_.]+$/; // Alphanumeric and basic punctuation
  return name.length > 0 && name.length <= maxLength && regex.test(name);
}

function closePanel() {
  // Implement panel closing logic, depending on how the panel is opened
  window.close();
}