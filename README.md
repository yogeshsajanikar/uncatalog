
This is a [codemod](https://codemod.com) created with [```codemod init```](https://docs.codemod.com/deploying-codemods/cli#codemod-init).

## Using this codemod
You can run this codemod with the following command:
```bash
npx codemod pnpm-uncatalog
```

It works when 
- `pnpm-workspace.yaml` file is present in the root of the project
- `pnpm-workspace.yaml` file has `packages` key
- `pnpm-workspace.yaml` file has `catalog` key, and you are using `catalog:` as package versions in dependencies.
- It works with `dependencies`, `devDependencies`, `peerDependencies` and `optionalDependencies` keys in `package.json` files.
- It also modifies `package.json` file if it has `catalog:` as package versions in dependencies.

It does not work with `overrides` such as 
```json
{
  "pnpm": {
    "overrides": {
      "package1@v1>package2": "catalog:"
    }
  }
}
```

You might have to manually change these overrides. It also does not work *yet* with non-default catalogs.

### Before


#### Workspace file `pnpm-workspace.yaml`
```yaml
packages: 
  - package1
  - package2
  - libraries/packages*
catalog:
  "some-package": "1.0.0"
```

#### Package file `package.json`
```json
{
  "dependencies": {
    "some-package": "catalog:"
  }
}
```


### After

#### Workspace file `pnpm-workspace.yaml`
```yaml 
packages: 
  - package1
  - package2
  - libraries/packages*
```

#### Package file `package.json`
```json
{
  "dependencies": {
    "some-package": "1.0.0"
  }
}
```

### Note 
- It will preserve the version specified in the `catalog` key in the `pnpm-workspace.yaml` file.
- It will remove the `catalog:` from the `package.json` file and replace it with the version specified in the `catalog` key in the `pnpm-workspace.yaml` file.
