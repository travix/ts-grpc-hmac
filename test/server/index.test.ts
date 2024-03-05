import { it } from "vitest";

it.skip("should work", ctx => {
    // prints name of the test
    console.log(ctx.task.name);
});
