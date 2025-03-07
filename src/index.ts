import type { Api } from "@codemod.com/workflow";

type WorkspaceFile = {
    packages: string[];
    catalog: { [key: string]: string };
}

export async function workflow({ files }: Api) {
  console.log("Hello, world!");
  const workspaceFiles = files("pnpm-workspace.yaml").yaml();
  const packages = await workspaceFiles
      .map(async (doc) => {
        const contents = await doc.getContents<WorkspaceFile>();
        return contents["packages"];
      });

  console.log(packages);

}

