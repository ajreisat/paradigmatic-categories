// tagPanelModifier.js

document.addEventListener('DOMContentLoaded', () => {
  // Wait for Zotero's UI to load
  setTimeout(initializeToggle, 1000);
});

function initializeToggle() {
  // Locate the tag panel container
  const tagPanel = document.querySelector('.tag-selector'); // Ensure this selector is accurate
  if (!tagPanel) {
    console.error('Tag panel not found.');
    return;
  }

  // Create toggle container
  const toggleContainer = document.createElement('div');
  toggleContainer.className = 'view-toggle';

  // Create toggle buttons
  const tagViewBtn = createToggleButton('Tag View', 'tag');
  const categoryViewBtn = createToggleButton('Category View', 'category');
  const paradigmViewBtn = createToggleButton('Paradigm View', 'paradigm');

  // Append buttons to toggle container
  toggleContainer.appendChild(tagViewBtn);
  toggleContainer.appendChild(categoryViewBtn);
  toggleContainer.appendChild(paradigmViewBtn);

  // Insert toggle container into the tag panel
  const filterPane = tagPanel.querySelector('.tag-selector-filter-pane');
  if (filterPane) {
    filterPane.insertBefore(toggleContainer, filterPane.firstChild);
  } else {
    // Fallback if filter pane not found
    tagPanel.insertBefore(toggleContainer, tagPanel.firstChild);
  }

  // Add event listeners
  tagViewBtn.addEventListener('click', () => switchView('tag'));
  categoryViewBtn.addEventListener('click', () => switchView('category'));
  paradigmViewBtn.addEventListener('click', () => switchView('paradigm'));

  // Load persisted view or default to 'tag'
  chrome.storage.local.get(['selectedView'], (result) => {
    const savedView = result.selectedView || 'tag';
    switchView(savedView);
  });
}

function createToggleButton(label, view) {
  const button = document.createElement('button');
  button.innerText = label;
  button.id = `toggle-${view}-view`;
  button.className = 'toggle-button';
  return button;
}

function switchView(view) {
  const tagPanel = document.querySelector('.tag-selector'); // Ensure this selector is accurate
  if (!tagPanel) return;

  // Hide all custom views
  const allViews = tagPanel.querySelectorAll('.custom-view');
  allViews.forEach(viewEl => {
    viewEl.style.display = 'none';
  });

  // Remove active class from all buttons
  document.querySelectorAll('.view-toggle .toggle-button').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected view
  let viewContent = tagPanel.querySelector(`.custom-view[data-view="${view}"]`);
  if (!viewContent) {
    viewContent = createViewContent(view);
    tagPanel.appendChild(viewContent);
  }
  viewContent.style.display = 'block';

  // Add active class to the clicked button
  document.querySelector(`#toggle-${view}-view`).classList.add('active');

  // Persist selected view
  chrome.storage.local.set({ selectedView: view });
}

function createViewContent(view) {
  const container = document.createElement('div');
  container.className = 'custom-view';
  container.setAttribute('data-view', view);

  if (view === 'tag') {
    // Render default tag view
    container.innerHTML = '<p>Tag View Content</p>'; // Placeholder
    // Integrate Zotero's existing tag display here if possible
  } else if (view === 'category') {
    // Render category view
    container.innerHTML = `
      <div class="category-view-content">
        <h3>Categories</h3>
        <ul id="category-list"></ul>
        <button id="open-add-category">Add Category</button>
      </div>
    `;
    loadCategoryView(container.querySelector('#category-list'));
    addCategoryButtonListener(container.querySelector('#open-add-category'));
  } else if (view === 'paradigm') {
    // Render paradigm view
    container.innerHTML = '<p>Paradigm View Content</p>'; // Placeholder for future implementation
  }

  return container;
}

function loadCategoryView(listElement) {
  chrome.runtime.sendMessage({ action: 'getAllCategories' }, (response) => {
    if (response.status === 'success') {
      const categories = response.categories;
      if (categories.length === 0) {
        listElement.innerHTML = '<li>No categories defined.</li>';
        return;
      }

      categories.forEach(cat => {
        const listItem = document.createElement('li');
        listItem.innerText = cat;
        listElement.appendChild(listItem);
      });
    } else {
      listElement.innerHTML = '<li>Error loading categories.</li>';
    }
  });
}

function addCategoryButtonListener(button) {
  button.addEventListener('click', () => {
    openAddCategoryPanel();
  });
}

function openAddCategoryPanel() {
  // Inject the addCategoryPanel.html content
  const panelHTML = `
    <div class="add-category-panel">
      <h2>Add New Category</h2>
      <input type="text" id="category-name" placeholder="Enter category name" maxlength="50">
      <div class="buttons">
        <button id="add-button">Add</button>
        <button id="cancel-button">Cancel</button>
      </div>
    </div>
  `;
  const tagPanel = document.querySelector('.tag-selector'); // Ensure this selector is accurate
  const existingPanel = tagPanel.querySelector('.add-category-panel');
  if (existingPanel) return; // Prevent multiple panels

  const panelContainer = document.createElement('div');
  panelContainer.className = 'add-category-panel-container';
  panelContainer.innerHTML = panelHTML;
  tagPanel.appendChild(panelContainer);

  // Attach event listeners
  const addButton = panelContainer.querySelector('#add-button');
  const cancelButton = panelContainer.querySelector('#cancel-button');
  const categoryNameInput = panelContainer.querySelector('#category-name');

  addButton.addEventListener('click', () => {
    const categoryName = categoryNameInput.value.trim();
    if (validateCategoryName(categoryName)) {
      chrome.runtime.sendMessage({ action: 'createCategory', name: categoryName }, (response) => {
        if (response.status === 'success') {
          alert('Category added successfully.');
          closeAddCategoryPanel(panelContainer);
          // Reload categories
          loadCategoryView(panelContainer.parentElement.querySelector('#category-list'));
        } else {
          alert(response.message || 'Failed to add category.');
        }
      });
    } else {
      alert('Invalid category name. Please ensure it is unique and within character limits.');
    }
  });

  cancelButton.addEventListener('click', () => {
    closeAddCategoryPanel(panelContainer);
  });
}

function validateCategoryName(name) {
  const maxLength = 50;
  const regex = /^[a-zA-Z0-9\s\-_.]+$/; // Alphanumeric and basic punctuation
  return name.length > 0 && name.length <= maxLength && regex.test(name);
}

function closeAddCategoryPanel(panelContainer) {
  panelContainer.remove();
}