export type Flags = Array<
  "install-dependencies" | "initialize-git" | "deploy-fiberplane"
>;

export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};
