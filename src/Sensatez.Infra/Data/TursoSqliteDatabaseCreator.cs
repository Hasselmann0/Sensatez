using Microsoft.EntityFrameworkCore.Sqlite.Storage.Internal;
using Microsoft.EntityFrameworkCore.Storage;

namespace Sensatez.Infra.Data;

/// <summary>
/// Adapts EF Core's SqliteDatabaseCreator for remote Turso/libSQL URLs,
/// avoiding Microsoft.Data.SqliteConnectionStringBuilder parsing of "Auth Token".
/// </summary>
#pragma warning disable EF1001 // Internal EF Core API usage.
public sealed class TursoSqliteDatabaseCreator : SqliteDatabaseCreator
{
    private readonly ISqliteRelationalConnection _connection;

    public TursoSqliteDatabaseCreator(
        RelationalDatabaseCreatorDependencies dependencies,
        ISqliteRelationalConnection connection,
        IRawSqlCommandBuilder rawSqlCommandBuilder)
        : base(dependencies, connection, rawSqlCommandBuilder)
    {
        _connection = connection;
    }

    private bool IsRemoteTurso =>
        (_connection.ConnectionString ?? string.Empty)
            .Contains("libsql://", StringComparison.OrdinalIgnoreCase);

    public override bool Exists() => IsRemoteTurso || base.Exists();

    public override Task<bool> ExistsAsync(CancellationToken cancellationToken = default) =>
        IsRemoteTurso ? Task.FromResult(true) : base.ExistsAsync(cancellationToken);

    public override void Create()
    {
        if (!IsRemoteTurso)
        {
            base.Create();
        }
    }

    public override Task CreateAsync(CancellationToken cancellationToken = default) =>
        IsRemoteTurso ? Task.CompletedTask : base.CreateAsync(cancellationToken);
}
#pragma warning restore EF1001
