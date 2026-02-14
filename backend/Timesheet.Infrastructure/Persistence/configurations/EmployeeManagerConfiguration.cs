using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Timesheet.Domain.Entities;

namespace Timesheet.Infrastructure.Persistence.Configurations;

public class EmployeeManagerConfiguration : IEntityTypeConfiguration<EmployeeManager>
{
    public void Configure(EntityTypeBuilder<EmployeeManager> builder)
    {
        builder.ToTable("EmployeeManagers");

        builder.HasKey(em => em.Id);

        builder.Property(em => em.Id)
               .ValueGeneratedOnAdd();

        builder.HasOne(em => em.Employee)
               .WithMany()
               .HasForeignKey(em => em.EmployeeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(em => em.Manager)
               .WithMany()
               .HasForeignKey(em => em.ManagerId)
               .OnDelete(DeleteBehavior.Restrict);

        // Prevent duplicate employee-manager mapping
        builder.HasIndex(em => new { em.EmployeeId, em.ManagerId })
               .IsUnique();
    }
}
