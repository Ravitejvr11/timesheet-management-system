using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Timesheet.Domain.Entities;

namespace Timesheet.Infrastructure.Persistence.Configurations;

public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
       public void Configure(EntityTypeBuilder<Project> builder)
       {
              builder.ToTable("Projects");

              builder.HasKey(p => p.Id);

              builder.Property(p => p.Id)
                     .ValueGeneratedOnAdd();

              builder.Property(p => p.Name)
                     .IsRequired()
                     .HasMaxLength(200);

              builder.Property(p => p.Code)
                     .IsRequired()
                     .HasMaxLength(50);

              builder.Property(p => p.ClientName)
                     .IsRequired()
                     .HasMaxLength(200);

              builder.Property(p => p.Description)
                     .HasMaxLength(1000);

              builder.Property(p => p.Status)
                     .IsRequired();

              builder.Property(p => p.IsBillable)
                     .IsRequired();

              builder.Property(p => p.ManagerId)
              .IsRequired();

              builder.HasOne(p => p.Manager)
                     .WithMany()
                     .HasForeignKey(p => p.ManagerId)
                     .OnDelete(DeleteBehavior.Restrict);

              builder.HasMany(p => p.EmployeeProjects)
                     .WithOne(ep => ep.Project)
                     .HasForeignKey(ep => ep.ProjectId)
                     .OnDelete(DeleteBehavior.Cascade);
       }
}
