using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Timesheet.Domain.Entities;

namespace Timesheet.Infrastructure.Persistence.Configurations;

public class EmployeeProjectConfiguration : IEntityTypeConfiguration<EmployeeProject>
{
    public void Configure(EntityTypeBuilder<EmployeeProject> builder)
    {
        builder.ToTable("EmployeeProjects");

        builder.HasKey(ep => ep.Id);

        builder.Property(ep => ep.Id)
               .ValueGeneratedOnAdd();

        builder.HasOne(ep => ep.Project)
               .WithMany(p => p.EmployeeProjects)
               .HasForeignKey(ep => ep.ProjectId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ep => ep.Employee)
               .WithMany()
               .HasForeignKey(ep => ep.EmployeeId)
               .OnDelete(DeleteBehavior.Restrict);

        // Prevent duplicate assignments
        builder.HasIndex(ep => new { ep.ProjectId, ep.EmployeeId })
               .IsUnique();
    }
}
