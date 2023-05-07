---
'koa-zod-router': major
---

Improved Router context by extending Koa.Context (Potential breaking change)

Previously, Router context did not extend Koa.Context due to potential conflicts with other third-party libraries that may have overridden Koa.Context globally. However, after addressing all internal issues, we have now enhanced Router context by extending Koa.Context for better interoperability with other Koa-based libraries.

While we have conducted thorough testing, there is still a possibility that this change may affect some third-party libraries. Hence, we are flagging this as a potential breaking change.

Added feature: validationErrorHandler option for router-wide error handling
