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
  create(context) {
    // Parse the `additionalHooks` regex.
    const additionalHooks =
      context.options &&
      context.options[0] &&
      context.options[0].additionalHooks
        ? new RegExp(context.options[0].additionalHooks)
        : undefined;

    const options = {
      additionalHooks,
    };

    function reportProblem(problem) {
      context.report(problem);
    }

    /**
     * STEP 2. This function checks the hooks and makes the errors
     *
     * Visitor for both function expressions and arrow function expressions.
     */
    function visitFunctionWithDependencies(
      node,
      declaredDependenciesNode,
      reactiveHook,
      reactiveHookName,
      isEffect,
    ) {
      if (declaredDependenciesNode.type !== 'ArrayExpression') {
        // If the declared dependencies are not an array expression then we
        // can't verify that the user provided the correct dependencies. Tell
        // the user this in an error.
        reportProblem({
          node: declaredDependenciesNode,
          message:
            `React Hook ${context.getSource(reactiveHook)} was passed a ` +
            'dependency list that is not an array literal. This means we ' +
            "can't statically verify whether you've passed the correct " +
            'dependencies.',
        });
      } else {
        declaredDependenciesNode.elements.forEach(declaredDependencyNode => {
          // Skip elided elements.
          if (declaredDependencyNode === null) {
            return;
          }
            reportProblem({
              node: declaredDependencyNode,
              message:
            });
            return;
          }
        });
      }
    }

    /**
     * STEP 1. This function finds all the hooks
     */
    function visitCallExpression(node) {
      const callbackIndex = getReactiveHookCallbackIndex(node.callee, options);
      if (callbackIndex === -1) {
        // Not a React Hook call that needs deps.
        return;
      }
      const callback = node.arguments[callbackIndex];
      const reactiveHook = node.callee;
      const reactiveHookName = getNodeWithoutReactNamespace(reactiveHook).name;
      const declaredDependenciesNode = node.arguments[callbackIndex + 1];
      const isEffect = /Effect($|[^a-z])/g.test(reactiveHookName);

      // Check the declared dependencies for this reactive hook. If there is no
      // second argument then the reactive callback will re-run on every render.
      // So no need to check for dependency inclusion.
      if (!declaredDependenciesNode && !isEffect) {

      switch (callback.type) {
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
          visitFunctionWithDependencies(
            callback,
            declaredDependenciesNode,
            reactiveHook,
            reactiveHookName,
            isEffect,
          );
          return; // Handled
        case 'Identifier':
          if (!declaredDependenciesNode) {
            // No deps, no problems.
            return; // Handled
          }
          // The function passed as a callback is not written inline.
          // But perhaps it's in the dependencies array?
          if (
            declaredDependenciesNode.elements &&
            declaredDependenciesNode.elements.some(
              el => el && el.type === 'Identifier' && el.name === callback.name,
            )
          ) {
            // If it's already in the list of deps, we don't care because
            // this is valid regardless.
            return; // Handled
          }
          // We'll do our best effort to find it, complain otherwise.
          const variable = context.getScope().set.get(callback.name);
          if (variable == null || variable.defs == null) {
            // If it's not in scope, we don't care.
            return; // Handled
          }
          // The function passed as a callback is not written inline.
          // But it's defined somewhere in the render scope.
          // We'll do our best effort to find and check it, complain otherwise.
          const def = variable.defs[0];
          if (!def || !def.node) {
            break; // Unhandled
          }
          if (def.type !== 'Variable' && def.type !== 'FunctionName') {
            // Parameter or an unusual pattern. Bail out.
            break; // Unhandled
          }
          switch (def.node.type) {
            case 'FunctionDeclaration':
              // useEffect(() => { ... }, []);
              visitFunctionWithDependencies(
                def.node,
                declaredDependenciesNode,
                reactiveHook,
                reactiveHookName,
                isEffect,
              );
              return; // Handled
            case 'VariableDeclarator':
              const init = def.node.init;
              if (!init) {
                break; // Unhandled
              }
              switch (init.type) {
                // const effectBody = () => {...};
                // useEffect(effectBody, []);
                case 'ArrowFunctionExpression':
                case 'FunctionExpression':
                  // We can inspect this function as if it were inline.
                  visitFunctionWithDependencies(
                    init,
                    declaredDependenciesNode,
                    reactiveHook,
                    reactiveHookName,
                    isEffect,
                  );
                  return; // Handled
              }
              break; // Unhandled
          }
          break; // Unhandled
        default:
          // useEffect(generateEffectBody(), []);
          reportProblem({
            node: reactiveHook,
            message:
              `React Hook ${reactiveHookName} received a function whose dependencies ` +
              `are unknown. Pass an inline function instead.`,
          });
          return; // Handled
      }
    }

    return {
      CallExpression: visitCallExpression,
    };
  },
};

/**
 * Mark a node as either optional or required.
 * Note: If the node argument is an OptionalMemberExpression, it doesn't necessarily mean it is optional.
 * It just means there is an optional member somewhere inside.
 * This particular node might still represent a required member, so check .optional field.
 */
function markNode(node, optionalChains, result) {
  if (optionalChains) {
    if (node.optional) {
      // We only want to consider it optional if *all* usages were optional.
      if (!optionalChains.has(result)) {
        // Mark as (maybe) optional. If there's a required usage, this will be overridden.
        optionalChains.set(result, true);
      }
    } else {
      // Mark as required.
      optionalChains.set(result, false);
    }
  }
}

/**
 * Assuming () means the passed node.
 * (foo) -> 'foo'
 * foo(.)bar -> 'foo.bar'
 * foo.bar(.)baz -> 'foo.bar.baz'
 * Otherwise throw.
 */
function analyzePropertyChain(node, optionalChains) {
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
    const result = node.name;
    if (optionalChains) {
      // Mark as required.
      optionalChains.set(result, false);
    }
    return result;
  } else if (node.type === 'MemberExpression' && !node.computed) {
    const object = analyzePropertyChain(node.object, optionalChains);
    const property = analyzePropertyChain(node.property, null);
    const result = `${object}.${property}`;
    markNode(node, optionalChains, result);
    return result;
  } else if (node.type === 'OptionalMemberExpression' && !node.computed) {
    const object = analyzePropertyChain(node.object, optionalChains);
    const property = analyzePropertyChain(node.property, null);
    const result = `${object}.${property}`;
    markNode(node, optionalChains, result);
    return result;
  } else if (node.type === 'ChainExpression' && !node.computed) {
    const expression = node.expression;

    if (expression.type === 'CallExpression') {
      throw new Error(`Unsupported node type: ${expression.type}`);
    }

    const object = analyzePropertyChain(expression.object, optionalChains);
    const property = analyzePropertyChain(expression.property, null);
    const result = `${object}.${property}`;
    markNode(expression, optionalChains, result);
    return result;
  } else {
    throw new Error(`Unsupported node type: ${node.type}`);
  }
}

function getNodeWithoutReactNamespace(node, options) { // js-ts
  if (
    node.type === 'MemberExpression' &&
    node.object.type === 'Identifier' &&
    node.object.name === 'React' &&
    node.property.type === 'Identifier' &&
    !node.computed
  ) {
    return node.property;
  }
  return node;
}

// What's the index of callback that needs to be analyzed for a given Hook?
// -1 if it's not a Hook we care about (e.g. useState).
// 0 for useEffect/useMemo/useCallback(fn).
// 1 for useImperativeHandle(ref, fn).
// For additionally configured Hooks, assume that they're like useEffect (0).
function getReactiveHookCallbackIndex(calleeNode, options) {
  const node = getNodeWithoutReactNamespace(calleeNode);
  if (node.type !== 'Identifier') {
    return -1;
  }
  switch (node.name) {
    case 'useEffect':
    case 'useLayoutEffect':
    case 'useCallback':
    case 'useMemo':
      // useEffect(fn)
      return 0;
    case 'useImperativeHandle':
      // useImperativeHandle(ref, fn)
      return 1;
    default:
      if (node === calleeNode && options && options.additionalHooks) {
        // Allow the user to provide a regular expression which enables the lint to
        // target custom reactive hooks.
        let name;
        try {
          name = analyzePropertyChain(node, null);
        } catch (error) {
          if (/Unsupported node type/.test(error.message)) {
            return 0;
          } else {
            throw error;
          }
        }
        return options.additionalHooks.test(name) ? 0 : -1;
      } else {
        return -1;
      }
  }
}
