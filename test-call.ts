import { createServerFn } from "@tanstack/react-start";
const myFn = createServerFn({ method: "POST" })
  .inputValidator((data: { query: string }) => data)
  .handler(async (ctx) => {
    console.log("Called with:", ctx.data);
    return [{ name: "Test" }];
  });

console.log(myFn({ data: { query: "hello" } }));
