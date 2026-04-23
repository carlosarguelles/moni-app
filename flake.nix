{
  description = "Moni — React SPA dev environment";

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
          buildInputs = [ pkgs.nodejs_20 pkgs.imagemagick ];
          shellHook = ''
            echo "Node $(node --version) | npm $(npm --version)"
            echo "Run: npm install && npm run dev"
          '';
        };

        packages.default = pkgs.buildNpmPackage {
          pname = "moni";
          version = "1.0.0";
          src = ./.;
          npmDepsHash = "sha256-gWvaznE0/2ia03jK9LtwkZM9YiRo6yKFypeaVMvLEbU=";
          VITE_BASE_URL = builtins.getEnv "VITE_BASE_URL";
          buildPhase = "npm run build";
          installPhase = "cp -r dist/. $out/";
        };
      }
    );
}