/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

import ReferenceDeps from './ReferenceDeps';

export const configs = {
  recommended: {
    plugins: ['react-hooks-unreliable-deps'],
    rules: {
      'react-hooks-unreliable-deps/reference-deps': ['warn', {
        'avoidObjects': true
      }]
    },
  },
};

export const rules = {
  'reference-deps': ReferenceDeps,
};
