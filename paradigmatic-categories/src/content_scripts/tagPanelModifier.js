// tagPanelModifier.js

document.addEventListener('DOMContentLoaded', () => {
  // Wait for Zotero's UI to load
  setTimeout(() => {
    Services.console.logStringMessage('--tagPanelModifier.js loaded.');
    initializeToggle();
    addItemTagPanelButton();
  }, 1000);
});

function initializeToggle() {
  try {
    // Locate the tag panel container
    const tagPanel = document.querySelector('.tag-selector'); // Verify this selector
    if (!tagPanel) {
      Services.console.logStringMessage('Tag panel not found.');
      return;
    }

    // Create toggle container
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'view-toggle';
    Services.console.logStringMessage('--Toggle container created.');

    // Create toggle buttons
    const tagViewBtn = createToggleButton('Tag View', 'tag');
    Services.console.logStringMessage('--Tag View button was generated.');

    const categoryViewBtn = createToggleButton('Category View', 'category');
    Services.console.logStringMessage('--Category View button was generated.');

    const paradigmViewBtn = createToggleButton('Paradigm View', 'paradigm');
    Services.console.logStringMessage('--Paradigm View button was generated.');

    // Append buttons to toggle container
    toggleContainer.appendChild(tagViewBtn);
    toggleContainer.appendChild(categoryViewBtn);
    toggleContainer.appendChild(paradigmViewBtn);

    // Append the new feature toggle button
    const newFeatureToggleButton = createToggleButton('My New Feature', 'new-feature');
    toggleContainer.appendChild(newFeatureToggleButton);
    Services.console.logStringMessage('--My New Feature toggle button was generated.');

    // Insert toggle container into the tag panel
    const filterPane = tagPanel.querySelector('.tag-selector-filter-pane');
    if (filterPane) {
      filterPane.insertBefore(toggleContainer, filterPane.firstChild);
      Services.console.logStringMessage('--Toggle container added to filter pane.');
    } else {
      // Fallback if filter pane not found
      tagPanel.insertBefore(toggleContainer, tagPanel.firstChild);
      Services.console.logStringMessage('--Toggle container added to tag panel.');
    }

    // Add event listeners
    tagViewBtn.addEventListener('click', () => switchView('tag'));
    categoryViewBtn.addEventListener('click', () => switchView('category'));
    paradigmViewBtn.addEventListener('click', () => switchView('paradigm'));
    newFeatureToggleButton.addEventListener('click', () => {
      Services.console.logStringMessage('My New Feature toggle button clicked!');
      alert('My New Feature toggle button clicked!');
      // Add your custom functionality here
    });

    // Load persisted view or default to 'tag'
    const savedView = Zotero.Prefs.get('extensions.paracate.selectedView') || 'tag';
    Services.console.logStringMessage(`--Loaded saved view: ${savedView}`);
    switchView(savedView);
  } catch (error) {
    Services.console.logStringMessage(`Error in initializeToggle: ${error}`);
  }
}

function createToggleButton(label, view) {
  const button = document.createElement('button');
  button.innerText = label;
  button.id = `toggle-${view}-view`;
  button.className = 'toggle-button';
  button.addEventListener('click', () => {
    Services.console.logStringMessage(`${label} button clicked.`);
    // Additional custom functionality can be added here
  });
  return button;
}

// Function to add a button to the item tag panel
function addItemTagPanelButton() {
  try {
    // Locate the item tag panel
    let itemTagPanel = Zotero.getMainWindow().document.getElementById('zotero-tagselector');
    if (!itemTagPanel) {
      Services.console.logStringMessage('Item Tag Panel not found.');
      return;
    }

    // Create a new button for the item tag panel
    let newFeatureItemPanelButton = document.createElement('button');
    newFeatureItemPanelButton.innerText = 'New Feature';
    newFeatureItemPanelButton.id = 'new-feature-button-item-panel';
    newFeatureItemPanelButton.classList.add('zotero-tagpanel-button'); // Optional: Add class for styling
    Services.console.logStringMessage('--New Feature button for Item Tag Panel created.');

    // Add click event to the button
    newFeatureItemPanelButton.addEventListener('click', function() {
      Services.console.logStringMessage('Item Tag Panel button clicked!');
      alert('Item Tag Panel button clicked!');
      // Add your custom functionality here
    });

    // Append the button to the item tag panel
    itemTagPanel.appendChild(newFeatureItemPanelButton);
    Services.console.logStringMessage('--New Feature button appended to Item Tag Panel.');
  } catch (error) {
    Services.console.logStringMessage(`Error in addItemTagPanelButton: ${error}`);
  }
}

function switchView(view) {
  try {
    const tagPanel = document.querySelector('.tag-selector'); // Verify this selector
    if (!tagPanel) {
      Services.console.logStringMessage('Tag panel not found in switchView.');
      return;
    }

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
      Services.console.logStringMessage(`--Created new view content for: ${view}`);
    }
    viewContent.style.display = 'block';

    // Add active class to the clicked button
    const activeButton = document.querySelector(`#toggle-${view}-view`);
    if (activeButton) {
      activeButton.classList.add('active');
      Services.console.logStringMessage(`--Active view set to: ${view}`);
    }

    // Persist selected view
    Zotero.Prefs.set('extensions.paracate.selectedView', view);
    Services.console.logStringMessage(`--Persisted selected view: ${view}`);
  } catch (error) {
    Services.console.logStringMessage(`Error in switchView: ${error}`);
  }
}

function createViewContent(view) {
  const container = document.createElement('div');
  container.className = 'custom-view';
  container.setAttribute('data-view', view);

  if (view === 'tag') {
    // Render default tag view
    container.innerHTML = '<p>Tag View Content</p>'; // Placeholder
    Services.console.logStringMessage('--Tag View content created.');
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
    Services.console.logStringMessage('--Category View content created.');
    loadCategoryView(container.querySelector('#category-list'));
    addCategoryButtonListener(container.querySelector('#open-add-category'));
  } else if (view === 'paradigm') {
    // Render paradigm view
    container.innerHTML = '<p>Paradigm View Content</p>'; // Placeholder for future implementation
    Services.console.logStringMessage('--Paradigm View content created.');
  }

  return container;
}

function loadCategoryView(listElement) {
  try {
    // Direct call to categoryManager (assumed to be in context)
    const categories = categoryManager.getAllCategories(); // Direct function call
    Services.console.logStringMessage(`--Loaded categories: ${JSON.stringify(categories)}`);
    if (categories.length === 0) {
      listElement.innerHTML = '<li>No categories defined.</li>';
      return;
    }

    listElement.innerHTML = ''; // Clear existing list
    categories.forEach(cat => {
      const listItem = document.createElement('li');
      listItem.innerText = cat;
      listElement.appendChild(listItem);
    });
  } catch (error) {
    Services.console.logStringMessage(`Error in loadCategoryView: ${error}`);
    listElement.innerHTML = '<li>Error loading categories.</li>';
  }
}

function addCategoryButtonListener(button) {
  button.addEventListener('click', () => {
    openAddCategoryPanel();
  });
}

function openAddCategoryPanel() {
  try {
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
    const tagPanel = document.querySelector('.tag-selector'); // Verify this selector
    const existingPanel = tagPanel.querySelector('.add-category-panel');
    if (existingPanel) return; // Prevent multiple panels

    const panelContainer = document.createElement('div');
    panelContainer.className = 'add-category-panel-container';
    panelContainer.innerHTML = panelHTML;
    tagPanel.appendChild(panelContainer);
    Services.console.logStringMessage('--Add Category panel injected.');

    // Attach event listeners
    const addButton = panelContainer.querySelector('#add-button');
    const cancelButton = panelContainer.querySelector('#cancel-button');
    const categoryNameInput = panelContainer.querySelector('#category-name');

    addButton.addEventListener('click', () => {
      const categoryName = categoryNameInput.value.trim();
      if (validateCategoryName(categoryName)) {
        // Direct call to categoryManager instead of chrome.runtime
        const success = categoryManager.createCategory(categoryName);
        if (success) {
          Services.console.logStringMessage(`Category "${categoryName}" added successfully.`);
          alert('Category added successfully.');
          closeAddCategoryPanel(panelContainer);
          // Reload categories
          loadCategoryView(panelContainer.parentElement.querySelector('#category-list'));
        } else {
          Services.console.logStringMessage(`Category "${categoryName}" already exists.`);
          alert('Category already exists.');
        }
      } else {
        Services.console.logStringMessage('Invalid category name entered.');
        alert('Invalid category name. Please ensure it is unique and within character limits.');
      }
    });

    cancelButton.addEventListener('click', () => {
      Services.console.logStringMessage('--Add Category panel canceled.');
      closeAddCategoryPanel(panelContainer);
    });
  } catch (error) {
    Services.console.logStringMessage(`Error in openAddCategoryPanel: ${error}`);
  }
}

function validateCategoryName(name) {
  const maxLength = 50;
  const regex = /^[a-zA-Z0-9\s\-_.]+$/; // Alphanumeric and basic punctuation
  const isValid = name.length > 0 && name.length <= maxLength && regex.test(name);
  Services.console.logStringMessage(`--validateCategoryName("${name}"): ${isValid}`);
  return isValid;
}

function closeAddCategoryPanel(panelContainer) {
  panelContainer.remove();
  Services.console.logStringMessage('--Add Category panel closed.');
}