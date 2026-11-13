# Estágio 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copia os csproj e restaura dependências (aproveita cache do Docker)
COPY ["src/Sensatez.Api/Sensatez.Api.csproj", "src/Sensatez.Api/"]
COPY ["src/Sensatez.Application/Sensatez.Application.csproj", "src/Sensatez.Application/"]
COPY ["src/Sensatez.Domain/Sensatez.Domain.csproj", "src/Sensatez.Domain/"]
COPY ["src/Sensatez.Infra/Sensatez.Infra.csproj", "src/Sensatez.Infra/"]
RUN dotnet restore "src/Sensatez.Api/Sensatez.Api.csproj"

# Copia o restante do código-fonte e publica em Release
COPY src/ src/
WORKDIR "/src/src/Sensatez.Api"
RUN dotnet publish "Sensatez.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Estágio 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Sensatez.Api.dll"]

