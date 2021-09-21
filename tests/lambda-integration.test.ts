import execa from "execa";

test("Should be able to call npx remotion lambda", async () => {
  const task = await execa("npx", ["remotion", "lambda", "functions"], {
    cwd: "packages/example",
  });
  expect(task.stdout).toContain("Available subcommands");
});
