// bootstrap.js

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var chromeHandle;

function install(data, reason) {}

// Startup function
function startup({ id, version, resourceURI, rootURI }, reason) {
  // Ensure Zotero is initialized before proceeding
  Zotero.initializationPromise.then(() => {
    // Initialize the shared context
    if (!Zotero.ParadigmaticCategories) {
      Zotero.ParadigmaticCategories = {};
      Zotero.ParadigmaticCategories._globalThis = Zotero.ParadigmaticCategories; // Globalize the context
    }

    // Fallback to resourceURI.spec if rootURI is not available
    if (!rootURI) {
      rootURI = resourceURI.spec;
    }

    // Ensure rootURI ends with a slash
    if (!rootURI.endsWith('/')) {
      rootURI += '/';
    }

    // Make sure rootURI has a proper scheme (e.g., jar:file:///)
    if (!rootURI.startsWith('file://') && !rootURI.startsWith('jar:file://')) {
      rootURI = `file://${rootURI}`;
    }

  try {
    // Register the chrome package for the plugin
    var aomStartup = Components.classes["@mozilla.org/addons/addon-manager-startup;1"]
      .getService(Components.interfaces.amIAddonManagerStartup);
    var manifestURI = Services.io.newURI(rootURI + "manifest.json");
    chromeHandle = aomStartup.registerChrome(manifestURI, [["content", "paracate", rootURI + "src/"]]);

    // Assign chromeHandle and rootURI to ParadigmaticCategories for later use
    Zotero.ParadigmaticCategories.chromeHandle = chromeHandle;
    Zotero.ParadigmaticCategories.rootURI = rootURI;

    // Load the categoryManager script
    Services.scriptloader.loadSubScript(`${rootURI}src/utils/categoryManager.js`, Zotero.ParadigmaticCategories);
    Zotero.debug('--categoryManager.js loaded.');

    // Load the background script
    Services.scriptloader.loadSubScript(`${rootURI}src/background/background.js`, Zotero.ParadigmaticCategories);
    Zotero.debug('--background.js loaded.');

    // Load the tagPanelModifier script
    Services.scriptloader.loadSubScript(`${rootURI}src/content_scripts/tagPanelModifier.js`, Zotero.ParadigmaticCategories);
    Zotero.debug('--tagPanelModifier.js loaded.');

    // Initialize hooks if they exist
    if (Zotero.ParadigmaticCategories?.hooks) {
      Zotero.debug("Calling onStartup hook for ParadigmaticCategories");
      Zotero.ParadigmaticCategories.hooks.onStartup();
    } else {
      Zotero.debug("ParadigmaticCategories hooks are not defined during startup.");
    }

  } catch (e) {
    Zotero.debug(`Error during startup: ${e}`);
  }
}).catch(error => {
  Zotero.debug(`Initialization promise failed: ${error}`);
});
}

// Handle main window load (if needed)
function onMainWindowLoad({ window }, reason) {
  if (Zotero.ParadigmaticCategories?.hooks) {
    Zotero.debug("Calling onMainWindowLoad hook for ParadigmaticCategories");
    Zotero.ParadigmaticCategories.hooks.onMainWindowLoad(window);
  } else {
    Zotero.debug("ParadigmaticCategories hooks are not defined during window load.");
  }
}

// Handle main window unload (if needed)
function onMainWindowUnload({ window }, reason) {
  if (Zotero.ParadigmaticCategories?.hooks) {
    Zotero.debug("Calling onMainWindowUnload hook for ParadigmaticCategories");
    Zotero.ParadigmaticCategories.hooks.onMainWindowUnload(window);
  } else {
    Zotero.debug("ParadigmaticCategories hooks are not defined during window unload.");
  }
}

// Shutdown function
function shutdown({ id, version, resourceURI, rootURI }, reason) {
  Zotero.debug("Shutting down ParadigmaticCategories plugin.");

  if (reason === APP_SHUTDOWN) {
    return;
  }

  // Handle shutdown hooks
  if (Zotero.ParadigmaticCategories?.hooks?.onShutdown) {
    Zotero.ParadigmaticCategories.hooks.onShutdown();
  }

  if (Zotero.ParadigmaticCategories && Zotero.ParadigmaticCategories.hooks) {
    Zotero.debug("Cleaning up hooks.");
    Zotero.ParadigmaticCategories.hooks = null;
  }

  // Destruct the chromeHandle
  if (chromeHandle) {
    chromeHandle.destruct();
    chromeHandle = null;
    Zotero.debug('Chrome handle destructed.');
  }

  // Clean up dynamically loaded scripts
  try {
    Cu.unload(`${Zotero.ParadigmaticCategories.rootURI}src/content_scripts/tagPanelModifier.js`);
    Zotero.debug('--tagPanelModifier.js unloaded.');
    Cu.unload(`${Zotero.ParadigmaticCategories.rootURI}src/background/background.js`);
    Zotero.debug('--background.js unloaded.');
    Cu.unload(`${Zotero.ParadigmaticCategories.rootURI}src/utils/categoryManager.js`);
    Zotero.debug('--categoryManager.js unloaded.');
  } catch (e) {
    Zotero.debug(`Error during script unloading: ${e}`);
  }

  // Flush string bundles (if using localized strings)
  try {
    Cc["@mozilla.org/intl/stringbundle;1"]
      .getService(Components.interfaces.nsIStringBundleService)
      .flushBundles();
  } catch (e) {
    Zotero.debug(`Error during string bundle flushing: ${e}`);
  }

  Zotero.debug('Plugin successfully shut down.');
}

// Uninstall function to handle plugin removal
function uninstall(data, reason) {}