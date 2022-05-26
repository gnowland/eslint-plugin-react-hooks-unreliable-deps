'use strict';

const RELEASE_CHANNEL = process.env.RELEASE_CHANNEL;

const __EXPERIMENTAL__ =
  typeof RELEASE_CHANNEL === 'string'
    ? RELEASE_CHANNEL === 'experimental'
    : true;

const bundleTypes = { //xx
  // NODE_ES2015: 'NODE_ES2015',
  // NODE_ESM: 'NODE_ESM',
  // UMD_DEV: 'UMD_DEV',
  // UMD_PROD: 'UMD_PROD',
  // UMD_PROFILING: 'UMD_PROFILING',
  NODE_DEV: 'NODE_DEV',
  NODE_PROD: 'NODE_PROD',
  // NODE_PROFILING: 'NODE_PROFILING',
  // FB_WWW_DEV: 'FB_WWW_DEV',
  // FB_WWW_PROD: 'FB_WWW_PROD',
  // FB_WWW_PROFILING: 'FB_WWW_PROFILING',
  // RN_OSS_DEV: 'RN_OSS_DEV',
  // RN_OSS_PROD: 'RN_OSS_PROD',
  // RN_OSS_PROFILING: 'RN_OSS_PROFILING',
  // RN_FB_DEV: 'RN_FB_DEV',
  // RN_FB_PROD: 'RN_FB_PROD',
  // RN_FB_PROFILING: 'RN_FB_PROFILING',
};

const { // xx
  // NODE_ES2015,
  // NODE_ESM,
  // UMD_DEV,
  // UMD_PROD,
  // UMD_PROFILING,
  NODE_DEV,
  NODE_PROD,
  // NODE_PROFILING,
  // FB_WWW_DEV,
  // FB_WWW_PROD,
  // FB_WWW_PROFILING,
  // RN_OSS_DEV,
  // RN_OSS_PROD,
  // RN_OSS_PROFILING,
  // RN_FB_DEV,
  // RN_FB_PROD,
  // RN_FB_PROFILING,
} = bundleTypes;

const moduleTypes = { // xx
  // React
  ISOMORPHIC: 'ISOMORPHIC',
  // Individual renderers. They bundle the reconciler. (e.g. ReactDOM)
  // RENDERER: 'RENDERER',
  // Helper packages that access specific renderer's internals. (e.g. TestUtils)
  // RENDERER_UTILS: 'RENDERER_UTILS',
  // Standalone reconciler for third-party renderers.
  // RECONCILER: 'RECONCILER',
};

// const {ISOMORPHIC, RENDERER, RENDERER_UTILS, RECONCILER} = moduleTypes;
const {ISOMORPHIC} = moduleTypes; // xx

const bundles = [

  // xx
  /******* ESLint Plugin for Hooks *******/
  {
    // TODO: it's awkward to create a bundle for this but if we don't, the package
    // won't get copied. We also can't create just DEV bundle because it contains a
    // NODE_ENV check inside. We should probably tweak our build process to allow
    // "raw" packages that don't get bundled.
    bundleTypes: [NODE_DEV, NODE_PROD],
    moduleType: ISOMORPHIC,
    entry: 'eslint-plugin-react-hooks-unreliable-deps',
    global: 'ESLintPluginReactHooksNoObjects',
    minifyWithProdErrorCodes: false,
    wrapWithModuleBoundaries: false,
    externals: [],
  },

];

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
  Object.freeze(o);
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop]);
    }
  });
  return o;
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles);
deepFreeze(bundleTypes);
deepFreeze(moduleTypes);

function getOriginalFilename(bundle, bundleType) {
  let name = bundle.name || bundle.entry;
  // const globalName = bundle.global; // xx
  // we do this to replace / to -, for react-dom/server
  name = name.replace('/index.', '.').replace('/', '-');
  switch (bundleType) { // xx
    // case NODE_ES2015:
    //   return `${name}.js`;
    // case NODE_ESM:
    //   return `${name}.js`;
    // case UMD_DEV:
    //   return `${name}.development.js`;
    // case UMD_PROD:
    //   return `${name}.production.min.js`;
    // case UMD_PROFILING:
    //   return `${name}.profiling.min.js`;
    case NODE_DEV:
      return `${name}.development.js`;
    case NODE_PROD:
      return `${name}.production.min.js`;
    // case NODE_PROFILING:
    //   return `${name}.profiling.min.js`;
    // case FB_WWW_DEV:
    // case RN_OSS_DEV:
    // case RN_FB_DEV:
    //   return `${globalName}-dev.js`;
    // case FB_WWW_PROD:
    // case RN_OSS_PROD:
    // case RN_FB_PROD:
    //   return `${globalName}-prod.js`;
    // case FB_WWW_PROFILING:
    // case RN_FB_PROFILING:
    // case RN_OSS_PROFILING:
    //   return `${globalName}-profiling.js`;
  }
}

function getFilename(bundle, bundleType) {
  const originalFilename = getOriginalFilename(bundle, bundleType);
  // Ensure .server.js or .client.js is the final suffix.
  // This is important for the Server tooling convention.
  if (originalFilename.indexOf('.server.') !== -1) {
    return originalFilename
      .replace('.server.', '.')
      .replace('.js', '.server.js');
  }
  if (originalFilename.indexOf('.client.') !== -1) {
    return originalFilename
      .replace('.client.', '.')
      .replace('.js', '.client.js');
  }
  return originalFilename;
}

module.exports = {
  bundleTypes,
  moduleTypes,
  bundles,
  getFilename,
};
