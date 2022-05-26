/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-for-of-loops/no-for-of-loops */

'use strict';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'checks the array of dependencies for Hooks like useEffect and similar for the existence of objects',
      recommended: true,
      url: 'https://www.benmvp.com/blog/object-array-dependencies-react-useEffect-hook/',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          additionalHooks: {
            type: 'string',
          },
        },
      },
    ],
  },
};
