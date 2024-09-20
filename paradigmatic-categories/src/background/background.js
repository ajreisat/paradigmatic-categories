// background.js

// Assign globalized context (_globalThis) to local ctx
ctx = _globalThis;

Services.console.logStringMessage('Log message here');
Services.console.logStringMessage(JSON.stringify(ctx.rootURI));  // Access the shared rootURI variable
Services.console.logStringMessage(JSON.stringify(ctx.chromeHandle));  // Access chromeHandle from ctx

// Load the categoryManager script
Services.scriptloader.loadSubScript(`${ctx.rootURI}/src/utils/categoryManager.js`, ctx);

// Ensure categoryManager is loaded
Services.console.logStringMessage(JSON.stringify(ctx.categoryManager));  // This should now log the categoryManager object

// Now we can use categoryManager for handling actions

// Example: Adding a new category called "MyCategory"
ctx.categoryManager.createCategory("MyCategory", (success) => {
  if (success) {
    Services.console.logStringMessage('Category "MyCategory" added successfully.');
  } else {
    Services.console.logStringMessage('Category "MyCategory" already exists.');
  }
});

// After adding the category, you can call getAllCategories to check if it's there
ctx.categoryManager.getAllCategories()
    .then(categories => {
        Services.console.logStringMessage(`Categories: ${JSON.stringify(categories)}`);
    })
    .catch(error => {
        Services.console.logStringMessage(`Error fetching categories: ${error}`);
    });

// Handle actions or other logic using direct method calls, hooks, or events