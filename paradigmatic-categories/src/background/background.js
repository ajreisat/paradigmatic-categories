// Access categoryManager from the shared context
let categoryManager = this.categoryManager;
Zotero.debug('categoryManager loaded successfully.');

// Assuming categoryManager functions are now available
async function manageCategories() {
  if (typeof categoryManager !== 'undefined') {
    try {
      let success = await categoryManager.createCategory("MyCategory");
      if (success) {
        Zotero.debug('Category "MyCategory" added successfully.');
      } else {
        Zotero.debug('Category "MyCategory" already exists or an error occurred.');
      }

      let categories = await categoryManager.getAllCategories();
      Zotero.debug(`Categories: ${JSON.stringify(categories)}`);
    } catch (error) {
      Zotero.debug(`Error managing categories: ${error}`);
    }
  } else {
    Zotero.debug('Error: categoryManager is not defined after loading.');
  }
}

// Call the function to manage categories
manageCategories();
