# koa-zod-router

## 2.0.1

### Patch Changes

- 22e8e50: Bump dependencies

## 2.0.0

### Major Changes

- 62874b1: Improved Router context by extending Koa.Context (Potential breaking change)

  Previously, koa-zod-router's context did not extend Koa.Context due to potential conflicts with other third-party libraries that may have overridden Koa.Context globally. However, after addressing all internal issues, we have now enhanced Router context by extending Koa.Context for better interoperability with other Koa-based libraries.

  While we have conducted thorough testing, there is still a possibility that this change may affect some third-party libraries. Hence, we are flagging this as a potential breaking change.

  Added feature: validationErrorHandler option for router-wide error handling

## 1.2.1

### Patch Changes

- 723f907: Move continueOnError to route specific option

## 1.2.0

### Minor Changes

- 12e0a9c: Add continueOnError flag for custom validation error handling support

## 1.1.4

### Patch Changes

- 8bc7684: Update deps, move internal type peer dependencies to dependencies

## 1.1.3

### Patch Changes

- ffb3890: Update Dependencies, fix formidable types causing tsc errors in declaration file

## 1.1.2

### Patch Changes

- 0df5a48: Fix broken async in noop middleware

## 1.1.1

### Patch Changes

- e98f5cd: Add github repository to package.json

## 1.1.0

### Minor Changes

- a0c71c6: Add state helpers, fix esm bundling, more descriptive zod errors in response

## 1.0.4

### Patch Changes

- caeac2e: Update type exports

## 1.0.3

### Patch Changes

- 5d879fd: Update peer dependencies

## 1.0.2

### Patch Changes

- 244e59a: Update Docs, fix transform type inference

## 1.0.1

### Patch Changes

- be19b89: Date type coercion fix

## 1.0.0

### Major Changes

- c8cabc0: Release v1
