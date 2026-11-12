using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sensatez.Infra.Migrations
{
    /// <inheritdoc />
    public partial class AddPartialUniqueIndexActiveLeaseContracts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_LeaseContracts_PropertyId_Active",
                table: "LeaseContracts",
                column: "PropertyId",
                unique: true,
                filter: "\"Status\" = 'Active' AND \"IsActive\" = true");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LeaseContracts_PropertyId_Active",
                table: "LeaseContracts");
        }
    }
}

