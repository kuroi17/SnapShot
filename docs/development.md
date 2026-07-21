# Development

## Getting Started

1. Clone the repository
2. Install [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
3. Install [Node.js](https://nodejs.org/) (for the website)

### Desktop App

```powershell
cd desktop
dotnet build src/SnapShot.csproj -c Debug
```

### Website

```powershell
cd website
npm install
npm run dev
```

## CI/CD

The `.github/workflows/release.yml` pipeline builds and publishes the desktop app on tag pushes.
