// ESLint flat config for the KixiHost monorepo.
// Each app/package may extend this with local overrides.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**", "**/coverage/**"],
  },
  {
    rules: {
      // No cross-provider leakage: infrastructure calls must go through packages/providers adapters.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["digitalocean*", "hcloud*", "ovh*"],
              message:
                "Chamadas directas a SDKs de providers são proibidas fora de packages/providers. Utilize o InfrastructureProvider adapter.",
            },
          ],
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
);
