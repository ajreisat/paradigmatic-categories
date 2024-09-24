// tagPanelModifier.js

// Early Logging to Confirm Script Execution
Zotero.debug('--tagPanelModifier.js script started.');

// Ensure Zotero is available
if (typeof Zotero === 'undefined' || typeof Zotero.getMainWindow !== 'function') {
  Zotero.debug('Zotero is not available or Zotero.getMainWindow is undefined.');
} else {
  // Get Zotero's main window
  const mainWindow = Zotero.getMainWindow();

  if (!mainWindow) {
    Zotero.debug('Unable to obtain Zotero\'s main window.');
  } else {
    // Function to initialize the plugin once the document is ready
    function initializePlugin(doc) {
      Zotero.debug('--tagPanelModifier.js loaded.');
      initializeToggleButtons(doc); // Pass document to the functions that need it
      createCategorySelectorPane(doc); // Pass document to the functions that need it
    }

    // Check if the document is already loaded
    if (mainWindow.document.readyState === 'complete' || mainWindow.document.readyState === 'interactive') {
      // Document is already ready
      initializePlugin(mainWindow.document);
    } else {
      // Wait for the main window's DOM to be fully loaded
      mainWindow.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          try {
            const doc = mainWindow.document;
            initializePlugin(doc);
          } catch (error) {
            Zotero.debug(`Error accessing main window's document: ${error}`);
          }
        }, 1000); // Adjust the timeout as needed
      });
    }
  }
}

/**
 * Initializes the toggle buttons in the tag-selector pane.
 * @param {Document} doc - The Zotero main window document.
 */
async function initializeToggleButtons(doc) {
  try {
    // Locate the tag selector
    const tagSelector = doc.querySelector('.tag-selector');
    if (!tagSelector) {
      Zotero.debug('Tag selector not found.');
      return;
    }

    // Create a container for the toggle buttons
    const toggleContainer = doc.createElement('div');
    toggleContainer.className = 'view-toggle-container';
    toggleContainer.style.marginBottom = '10px'; // Add spacing as needed

    // Create "Tag View" button
    const tagViewBtn = createToggleButton('Tag View', 'tag', doc);
    Zotero.debug('--Tag View button created.');

    // Create "Category View" button
    const categoryViewBtn = createToggleButton('Category View', 'category', doc);
    Zotero.debug('--Category View button created.');

    // Append buttons to the toggle container
    toggleContainer.appendChild(tagViewBtn);
    toggleContainer.appendChild(categoryViewBtn);

    // Insert the toggle container at the top of the tag-selector pane
    tagSelector.insertBefore(toggleContainer, tagSelector.firstChild);
    Zotero.debug('--Toggle buttons inserted at the top of the tag-selector.');

    // Attach event listeners to the buttons
    tagViewBtn.addEventListener('click', () => activateTagView(doc));
    categoryViewBtn.addEventListener('click', () => activateCategoryView(doc));

    // Set the default active view based on saved preference
    const savedView = await getUserPreference('selectedView') || 'tag';
    if (savedView === 'category') {
      activateCategoryView(doc);
    } else {
      activateTagView(doc);
    }
  } catch (error) {
    Zotero.debug(`Error in initializeToggleButtons: ${error}`);
  }
}

/**
 * Creates a toggle button.
 * @param {string} label - The button label.
 * @param {string} view - The view associated with the button ('tag' or 'category').
 * @param {Document} doc - The Zotero main window document.
 * @returns {HTMLButtonElement} - The created button element.
 */
function createToggleButton(label, view, doc) {
  const button = doc.createElement('button');
  button.innerText = label;
  button.id = `toggle-${view}-view`;
  button.className = 'btn btn-default toggle-button'; // Use Zotero's button classes
  button.style.marginRight = '5px'; // Add spacing between buttons
  return button;
}

/**
 * Activates the Tag View by showing the default tag-selector pane.
 * @param {Document} doc - The Zotero main window document.
 */
async function activateTagView(doc) {
  try {
    Zotero.debug('--Activating Tag View.');
    // Show the tag-selector-list-container
    const tagSelectorListContainer = doc.querySelector('.tag-selector-list-container');
    const categorySelectorContainer = doc.querySelector('.category-selector-container');

    if (categorySelectorContainer) {
      categorySelectorContainer.style.display = 'none';
    }

    if (tagSelectorListContainer) {
      tagSelectorListContainer.style.display = '';
    }

    // Update button states
    updateButtonStates(doc, 'tag');

    // Persist the selected view
    await setUserPreference('selectedView', 'tag');
    Zotero.debug('--Tag View activated and preference saved.');
  } catch (error) {
    Zotero.debug(`Error in activateTagView: ${error}`);
  }
}

/**
 * Activates the Category View by showing the custom category-selector pane.
 * @param {Document} doc - The Zotero main window document.
 */
async function activateCategoryView(doc) {
  try {
    Zotero.debug('--Activating Category View.');
    // Show the category-selector pane
    const tagSelectorListContainer = doc.querySelector('.tag-selector-list-container');
    const categorySelectorContainer = doc.querySelector('.category-selector-container');

    if (tagSelectorListContainer) {
      tagSelectorListContainer.style.display = 'none';
    }

    if (categorySelectorContainer) {
      categorySelectorContainer.style.display = '';
    } else {
      Zotero.debug('Category selector container not found.');
    }

    // Update button states
    updateButtonStates(doc, 'category');

    // Persist the selected view
    await setUserPreference('selectedView', 'category');
    Zotero.debug('--Category View activated and preference saved.');
  } catch (error) {
    Zotero.debug(`Error in activateCategoryView: ${error}`);
  }
}

/**
 * Updates the active state of toggle buttons.
 * @param {Document} doc - The Zotero main window document.
 * @param {string} activeView - The currently active view ('tag' or 'category').
 */
function updateButtonStates(doc, activeView) {
  try {
    const tagViewBtn = doc.getElementById('toggle-tag-view');
    const categoryViewBtn = doc.getElementById('toggle-category-view');

    if (activeView === 'tag') {
      tagViewBtn.classList.add('active');
      categoryViewBtn.classList.remove('active');
    } else if (activeView === 'category') {
      categoryViewBtn.classList.add('active');
      tagViewBtn.classList.remove('active');
    }
  } catch (error) {
    Zotero.debug(`Error in updateButtonStates: ${error}`);
  }
}

/**
 * Creates the Category Selector Pane.
 * @param {Document} doc - The Zotero main window document.
 */
function createCategorySelectorPane(doc) {
  try {
    // Check if the category selector already exists
    if (doc.querySelector('.category-selector-container')) {
      Zotero.debug('Category selector pane already exists.');
      return;
    }

    // Create the category selector container
    const categorySelectorContainer = doc.createElement('div');
    categorySelectorContainer.className = 'category-selector-container';
    categorySelectorContainer.style.display = 'none'; // Hidden by default

    // Populate the category selector pane using Zotero API
    populateCategorySelector(categorySelectorContainer, doc);

    // Insert the category selector pane into the tag-selector
    const tagSelector = doc.querySelector('.tag-selector');
    if (tagSelector) {
      // Insert after the toggle buttons
      if (tagSelector.firstChild.nextSibling) {
        tagSelector.insertBefore(categorySelectorContainer, tagSelector.firstChild.nextSibling);
      } else {
        tagSelector.appendChild(categorySelectorContainer);
      }
      Zotero.debug('--Category selector pane created and appended.');
    } else {
      Zotero.debug('Tag selector not found when creating category selector pane.');
    }
  } catch (error) {
    Zotero.debug(`Error in createCategorySelectorPane: ${error}`);
  }
}

/**
 * Populates the Category Selector Pane with categories.
 * @param {HTMLDivElement} container - The category selector container element.
 * @param {Document} doc - The Zotero main window document.
 */
async function populateCategorySelector(container, doc) {
  try {
    // Fetch categories using categoryManager
    const categories = await getCategories();

    // Create the category list
    const categoryList = doc.createElement('ul');
    categoryList.className = 'category-selector-list';

    if (categories.length === 0) {
      const emptyItem = doc.createElement('li');
      emptyItem.innerText = 'No categories defined.';
      categoryList.appendChild(emptyItem);
    } else {
      categories.forEach(category => {
        const listItem = doc.createElement('li');
        listItem.className = 'category-item';
        listItem.innerText = category;
        listItem.setAttribute('role', 'button');
        listItem.setAttribute('tabindex', '0');
        listItem.setAttribute('aria-pressed', 'false');
        // Add event listener for category selection if needed
        listItem.addEventListener('click', () => {
          // Implement category selection logic
          Zotero.debug(`Category "${category}" clicked.`);
          // Example: Filter items based on category
          filterItemsByCategory(category);
        });
        categoryList.appendChild(listItem);
      });
    }

    // Append the list to the container
    container.appendChild(categoryList);

    // Optionally, add a filter input similar to the tag filter
    const filterContainer = doc.createElement('div');
    filterContainer.className = 'category-selector-filter-container';
    filterContainer.style.marginTop = '10px';

    const filterInputGroup = doc.createElement('div');
    filterInputGroup.className = 'input-group input';

    const filterInput = doc.createElement('input');
    filterInput.className = 'category-selector-filter form-control';
    filterInput.type = 'search';
    filterInput.placeholder = 'Filter Categories';
    filterInput.setAttribute('aria-label', 'Filter Categories');

    // Add event listener for filtering categories
    filterInput.addEventListener('input', () => {
      const filterValue = filterInput.value.toLowerCase();
      const items = categoryList.querySelectorAll('.category-item');
      items.forEach(item => {
        if (item.innerText.toLowerCase().includes(filterValue)) {
          item.style.display = 'list-item';
        } else {
          item.style.display = 'none';
        }
      });
    });

    filterInputGroup.appendChild(filterInput);
    filterContainer.appendChild(filterInputGroup);
    container.appendChild(filterContainer);

    Zotero.debug('--Category selector pane populated.');
  } catch (error) {
    Zotero.debug(`Error in populateCategorySelector: ${error}`);
  }
}

/**
 * Retrieves categories using categoryManager.
 * @returns {Promise<string[]>} - A promise that resolves to an array of category names.
 */
async function getCategories() {
  try {
    // Access categoryManager from the shared context
    let categoryManager = this.categoryManager;

    if (!categoryManager) {
      Zotero.debug('categoryManager is not available.');
      return [];
    }

    let categories = await categoryManager.getAllCategories();
    return categories;

  } catch (error) {
    Zotero.debug(`Error in getCategories: ${error}`);
    return [];
  }
}

/**
 * Filters Zotero items based on the selected category.
 * @param {string} category - The selected category name.
 */
async function filterItemsByCategory(category) {
  try {
    // Implement the logic to filter items by category using Zotero's API
    const search = new Zotero.Search();
    search.addCondition('tag', 'is', category);
    const itemIDs = await search.search();

    // Select the items in the items pane
    const itemsView = Zotero.getActiveZoteroPane().getItemsView();
    itemsView.selectItems(itemIDs);

    Zotero.debug(`--Filtered ${itemIDs.length} items by category "${category}".`);
  } catch (error) {
    Zotero.debug(`Error in filterItemsByCategory: ${error}`);
  }
}

/**
 * Helper function to get a user preference.
 * @param {string} key - The preference key.
 * @returns {Promise<any>} - The preference value.
 */
async function getUserPreference(key) {
  return Zotero.Prefs.get(`extensions.paradigmaticCategories.${key}`);
}

/**
 * Helper function to set a user preference.
 * @param {string} key - The preference key.
 * @param {any} value - The preference value.
 * @returns {Promise<void>}
 */
async function setUserPreference(key, value) {
  return Zotero.Prefs.set(`extensions.paradigmaticCategories.${key}`, value);
}