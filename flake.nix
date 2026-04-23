{
  description = "Shared Expenses — React SPA dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [ pkgs.nodejs_20 ];
          shellHook = ''
            echo "Node $(node --version) | npm $(npm --version)"
            echo "Run: npm install && npm run dev"
          '';
        };

        packages.default = pkgs.buildNpmPackage {
          pname = "shared-expenses";
          version = "1.0.0";
          src = ./.;
          npmDepsHash = "sha256-wNVyjp5+jyu6/CEW/QuiT7Oye8S02JqFpMAS+/iTnc0=";
          VITE_BASE_URL = builtins.getEnv "VITE_BASE_URL";
          buildPhase = "npm run build";
          installPhase = "cp -r dist/. $out/";
        };
      }
    );
}