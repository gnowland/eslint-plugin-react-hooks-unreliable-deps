# `eslint-plugin-react-hooks-unreliable-deps`
[![npm](https://img.shields.io/npm/v/eslint-plugin-react-hooks-unreliable-deps.svg?style=flat-square)](https://www.npmjs.com/package/eslint-plugin-react-hooks-unreliable-deps)

This is a companion ESLint plugin for [`eslint-plugin-react-hooks`](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) to warn about potential issues arising from reference equality in [React Hooks API](https://reactjs.org/docs/hooks-intro.html) dependency arrays.

## Installation

Assuming you already have ESLint installed, run:

```sh
# npm
npm install eslint-plugin-react-hooks-unreliable-deps --save-dev

# yarn
yarn add eslint-plugin-react-hooks-unreliable-deps --dev
```

Then extend the recommended eslint config:

```js
{
  "extends": [
    // ...
    "plugin:react-hooks-unreliable-deps/recommended"
  ]
}
```

### Custom Configuration

If you want more fine-grained configuration, you can instead add a snippet like this to your ESLint configuration file:

```js
{
  "plugins": [
    // ...
    "react-hooks-unreliable-deps"
  ],
  "rules": {
    // ...
    "react-hooks-unreliable-deps/reference-deps": ["warn", {
      "avoidObjects": true
    }]
  }
}
```


## Advanced Configuration

`reference-deps` can be configured to validate dependencies of custom Hooks with the `additionalHooks` option.
This option accepts a regex to match the names of custom Hooks that have dependencies.

```js
{
  "rules": {
    // ...
    "react-hooks-unreliable-deps/reference-deps": ["warn", {
      "additionalHooks": "(useMyCustomHook|useMyOtherCustomHook)",
      "avoidObjects": true
    }]
  }
}
```

We suggest to use this option **very sparingly, if at all**. Generally saying, we recommend most custom Hooks to not use the dependencies argument, and instead provide a higher-level API that is more focused around a specific use case.

## Explanation

Please refer to this wonderful treatise [Object & Array Dependencies in the React useEffect Hook](https://www.benmvp.com/blog/object-array-dependencies-react-useEffect-hook/) to learn more about the impetus behind this rule.

## License

This project was forked from [facebook/react/.../eslint-plugin-react-hooks](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) and is inherently licensed under MIT.

## Development

Clone the repository and run `npm install` to initialize. Run `npm run build` to create the build packages.
