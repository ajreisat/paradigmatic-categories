// categoryManager.js

(async () => {
  // Ensure 'this' refers to the shared context
  let db;

  // Initialize categories in Zotero database if not present
  async function initializeCategories() {
    db = await Zotero.DB.getConnectionAsync();
    await db.execute(`
      CREATE TABLE IF NOT EXISTS paracate_categories (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE
      )
    `);
  }

  // Create a new category
  async function createCategory(name) {
    try {
      await db.execute(`INSERT INTO paracate_categories (name) VALUES (?)`, [name]);
      return true;
    } catch (e) {
      if (e.result === Components.results.NS_ERROR_STORAGE_CONSTRAINT) {
        // Category already exists
        return false;
      } else {
        Zotero.debug(`Error creating category: ${e}`);
        throw e;
      }
    }
  }

  // Delete a category
  async function deleteCategory(name) {
    try {
      await db.execute(`DELETE FROM paracate_categories WHERE name = ?`, [name]);
      return true;
    } catch (e) {
      Zotero.debug(`Error deleting category: ${e}`);
      return false;
    }
  }

  // Rename a category
  async function renameCategory(oldName, newName) {
    try {
      await db.execute(`UPDATE paracate_categories SET name = ? WHERE name = ?`, [newName, oldName]);
      return true;
    } catch (e) {
      Zotero.debug(`Error renaming category: ${e}`);
      return false;
    }
  }

  // Get all categories
  async function getAllCategories() {
    try {
      let result = await db.queryAsync(`SELECT name FROM paracate_categories`);
      return result.map(row => row.name);
    } catch (e) {
      Zotero.debug(`Error getting categories: ${e}`);
      return [];
    }
  }

  // Assign a category to an item
  async function assignCategory(itemId, categoryName) {
    try {
      // First, check if the category exists
      let categories = await getAllCategories();
      if (!categories.includes(categoryName)) {
        // Category does not exist
        return false;
      }

      // Then, assign the category to the item
      let item = await Zotero.Items.getAsync(itemId);
      if (!item) {
        // Item not found
        return false;
      }

      // Add the category as a tag to the item
      let tags = item.getTags().map(tag => tag.tag);
      if (!tags.includes(categoryName)) {
        await item.addTag(categoryName);
        await item.saveTx();
      }

      return true;
    } catch (e) {
      Zotero.debug(`Error assigning category: ${e}`);
      return false;
    }
  }

  // Remove a category from an item
  async function removeCategory(itemId, categoryName) {
    try {
      let item = await Zotero.Items.getAsync(itemId);
      if (!item) {
        // Item not found
        return false;
      }

      // Remove the category tag from the item
      let tags = item.getTags().map(tag => tag.tag);
      if (tags.includes(categoryName)) {
        await item.removeTag(categoryName);
        await item.saveTx();
      }

      return true;
    } catch (e) {
      Zotero.debug(`Error removing category: ${e}`);
      return false;
    }
  }

  // Initialize categories on load
  await initializeCategories();

  // Export functions by assigning them to 'this.categoryManager'
  this.categoryManager = {
    createCategory,
    deleteCategory,
    renameCategory,
    getAllCategories,
    assignCategory,
    removeCategory
  };

  Zotero.debug('--categoryManager.js initialized.');
})();
