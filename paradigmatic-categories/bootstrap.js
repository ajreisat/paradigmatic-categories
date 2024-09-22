var chromeHandle;

function install(data, reason) {}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  await Zotero.initializationPromise;

  // Fallback to resourceURI.spec if rootURI is not available
  if (!rootURI) {
    rootURI = resourceURI.spec;
  }

  // Register the chrome package for the plugin
  var aomStartup = Components.classes["@mozilla.org/addons/addon-manager-startup;1"]
    .getService(Components.interfaces.amIAddonManagerStartup);
  var manifestURI = Services.io.newURI(rootURI + "manifest.json");
  chromeHandle = aomStartup.registerChrome(manifestURI, [["content", "paracate", rootURI + "src/"]]);

  // Create the shared context (ctx)
  const ctx = {
    rootURI, // Making rootURI available to all scripts
    errorHandler: function(msg) { console.error(`Error: ${msg}`); }, // Example shared function
    chromeHandle, // Add chromeHandle to the shared context
  };
  ctx._globalThis = ctx; // Globalize the context

  // Load the background script within this shared context
  Services.scriptloader.loadSubScript(`${rootURI}/src/background/background.js`, ctx);
  Services.scriptloader.loadSubScript(`${rootURI}/src/content_scripts/tagPanelModifier.js`, ctx);

  // Hook to be run on plugin startup
  Zotero.ParadigmaticCategories?.hooks.onStartup();
}

async function onMainWindowLoad({ window }, reason) {
  // Hook for window-specific initialization
  Zotero.ParadigmaticCategories?.hooks.onMainWindowLoad(window);
}

async function onMainWindowUnload({ window }, reason) {
  // Hook for window-specific cleanup
  Zotero.ParadigmaticCategories?.hooks.onMainWindowUnload(window);
}

function shutdown({ id, version, resourceURI, rootURI }, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  // Check if Zotero is defined (during shutdown)
  if (typeof Zotero === "undefined") {
    Zotero = Components.classes["@zotero.org/Zotero;1"].getService(
      Components.interfaces.nsISupports,
    ).wrappedJSObject;
  }
  
  // Hook to be run during shutdown
  Zotero.ParadigmaticCategories?.hooks.onShutdown();

  // Clean up string bundles and unload the background script
  Cc["@mozilla.org/intl/stringbundle;1"]
    .getService(Components.interfaces.nsIStringBundleService)
    .flushBundles();

  // Unload all dynamically loaded scripts
  Cu.unload(`${rootURI}/src/background/background.js`);
  Cu.unload(`${rootURI}/src/utils/categoryManager.js`);
  Cu.unload(`${rootURI}/src/content_scripts/tagPanelModifier.js`);
  // Add other dynamically loaded scripts as needed

  // Destruct the chromeHandle to clean up resources
  if (chromeHandle) {
    chromeHandle.destruct();
    chromeHandle = null;
  }
}

function uninstall(data, reason) {}
