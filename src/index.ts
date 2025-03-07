import type {Api} from "@codemod.com/workflow";

type PackageJson = {
  name: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  optionalDependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
}

type WorkspaceFile = {
  packages: string[];
  catalog?: Record<string, string>;
}

type DependencyKey = (keyof PackageJson) & ("dependencies" | "devDependencies" | "optionalDependencies" | "peerDependencies");

/**
 * Update the dependencies in the package.json file
 * @param packageJson The package.json file to update
 * @param dependencyType The type of dependency to update
 * @param workspace The workspace file
 * @returns The updated package.json file
 * @throws If a package is using the catalog but is not in the workspace
 */
function updateDependencies(
  packageJson: PackageJson,
  dependencyType: DependencyKey,
  workspace: WorkspaceFile): PackageJson {
  // console.log(`Updating ${dependencyType} dependencies`);
  const dependencies = Object.keys(packageJson[dependencyType] || {});
  for (const dependency of dependencies) {
    // Check if the package is using the catalog
    const packageSpec = packageJson[dependencyType][dependency];
    const usingCatalog = packageSpec ? packageSpec == "catalog:" : false;
    if (!usingCatalog) {
      continue;
    }

    const workspaceSpec = workspace.catalog ? workspace.catalog[dependency] : undefined;

    if (!workspaceSpec) {
      throw new Error(`Package ${dependency} is using the catalog but is not in the workspace`);
    }

    // Update the package.json with the catalog version
    packageJson[dependencyType][dependency] = workspaceSpec;
  }

  return packageJson;
}

function updateAllDependencies(packageJson: PackageJson, workspace: WorkspaceFile): PackageJson {
  const dependencyTypes: DependencyKey[] = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies"
  ];

  dependencyTypes.reduce((previousPackage, currentKey) => updateDependencies(previousPackage, currentKey, workspace), packageJson);
  return packageJson;
}

export async function workflow({files, dirs}: Api) {
  const workspaceFiles = files("pnpm-workspace.yaml").yaml();
  const workspace = (await workspaceFiles
    .map(async (doc) => {
      return await doc.getContents<WorkspaceFile>();
    })).pop();

  if (!workspace) {
    throw new Error("No workspace file found");
  }

  console.log(`Found following packages: ${workspace.packages.join(", ")}`);
  console.log(`Does workspace supports catalog? = ${!!workspace.catalog}`);

  console.log("Reverting catalogs in packages");
  await dirs({
    dirs: workspace.packages,
    ignore: ["**/node_modules/**"]})
    .files("package.json")
    .json()
    .update<PackageJson>(async (packageJson) => updateAllDependencies(packageJson, workspace));

  console.log("Reverting catalog in root package.json");
  await files("package.json")
    .json()
    .update<PackageJson>(async (packageJson) => updateAllDependencies(packageJson, workspace));

  console.log("Removing catalog entry from workspace file");
  await workspaceFiles
    .update<WorkspaceFile>(async (workspace) => {
      delete workspace['catalog'];
      return workspace;
    });
}
