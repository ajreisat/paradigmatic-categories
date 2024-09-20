// categoryManager.js

const categoriesKey = 'paradigmaticCategories';

// Initialize categories in Zotero storage if not present
function initializeCategories() {
  let categories = Zotero.Prefs.get(categoriesKey);
  if (!categories) {
    Zotero.Prefs.set(categoriesKey, JSON.stringify([])); // Initialize empty array
  }
}

// Create a new category
function createCategory(name, callback) {
  let categories = JSON.parse(Zotero.Prefs.get(categoriesKey) || '[]');
  if (!categories.includes(name)) {
    categories.push(name);
    Zotero.Prefs.set(categoriesKey, JSON.stringify(categories));
    callback(true);
  } else {
    callback(false); // Category already exists
  }
}

// Delete a category
function deleteCategory(name, callback) {
  let categories = JSON.parse(Zotero.Prefs.get(categoriesKey) || '[]');
  categories = categories.filter(cat => cat !== name);
  Zotero.Prefs.set(categoriesKey, JSON.stringify(categories));
  callback(true);
}

// Rename a category
function renameCategory(oldName, newName, callback) {
  let categories = JSON.parse(Zotero.Prefs.get(categoriesKey) || '[]');
  const index = categories.indexOf(oldName);
  if (index !== -1 && !categories.includes(newName)) {
    categories[index] = newName;
    Zotero.Prefs.set(categoriesKey, JSON.stringify(categories));
    callback(true);
  } else {
    callback(false); // Old name not found or new name already exists
  }
}

// Get all categories
function getAllCategories() {
  return new Promise((resolve) => {
    let categories = JSON.parse(Zotero.Prefs.get(categoriesKey) || '[]');
    resolve(categories);
  });
}

// Assign a category to an item or collection
function assignCategory(itemId, category, callback) {
  let item = Zotero.Items.get(itemId);
  
  if (!item) {
    callback(false);  // Item not found
    return;
  }

  // Add the category as a tag to the item
  let tags = item.getTags();  // Get the existing tags
  if (!tags.includes(category)) {
    tags.push(category);  // Add the category if not already present
    item.setTags(tags);  // Set the updated tags
    item.saveTx();  // Save the changes
  }
  
  callback(true);  // Assignment successful
}

// Remove a category from an item or collection
function removeCategory(itemId, category, callback) {
  let item = Zotero.Items.get(itemId);

  if (!item) {
    callback(false);  // Item not found
    return;
  }

  // Remove the category as a tag from the item
  let tags = item.getTags();
  let updatedTags = tags.filter(tag => tag !== category);  // Filter out the category
  item.setTags(updatedTags);  // Set the updated tags
  item.saveTx();  // Save the changes
  
  callback(true);  // Removal successful
}

// Initialize categories on load
initializeCategories();

// Export functions
const categoryManager = {
  createCategory,
  deleteCategory,
  renameCategory,
  getAllCategories,
  assignCategory,
  removeCategory
};

// Add categoryManager to ctx if ctx exists (when loaded via loadSubScript)
if (typeof ctx !== 'undefined') {
  ctx.categoryManager = categoryManager;
}