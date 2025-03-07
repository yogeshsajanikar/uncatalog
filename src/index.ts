import type { Api } from "@codemod.com/workflow";

type WorkspaceFile = {
    packages: string[];
    catalog: { [key: string]: string };
}

export async function workflow({ files }: Api) {
  console.error("Hello, world!");
  const workspaceFiles = files("pnpm-workspace.yaml").yaml();
  const packages = await workspaceFiles
      .map(async (doc) => {
        const contents = await doc.getContents<WorkspaceFile>();
        return contents["packages"];
      });

  console.error(packages);

  // await files("**/*.ts")
  //   .jsFam()
  //   .astGrep("console.log($A)")
  //   .replace("console.error($A)");
}

