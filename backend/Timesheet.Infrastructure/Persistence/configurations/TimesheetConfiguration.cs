using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Timesheet.Domain.Entities;

namespace Timesheet.Infrastructure.Persistence.Configurations;

public class TimesheetConfiguration : IEntityTypeConfiguration<Domain.Entities.Timesheet>
{
    public void Configure(EntityTypeBuilder<Domain.Entities.Timesheet> builder)
    {
        builder.ToTable("Timesheets");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
               .ValueGeneratedOnAdd();

        builder.Property(t => t.WeekStartDate)
               .IsRequired();

        builder.Property(t => t.WeekEndDate)
               .IsRequired();

        builder.Property(t => t.TotalBillableHours)
               .HasPrecision(5, 2)
               .IsRequired();

        builder.Property(t => t.TotalNonBillableHours)
               .HasPrecision(5, 2)
               .IsRequired();

        builder.Property(t => t.Status)
               .IsRequired();

        builder.Property(t => t.Comments)
               .HasMaxLength(2000);

        builder.HasOne(t => t.Employee)
               .WithMany()
               .HasForeignKey(t => t.EmployeeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Project)
               .WithMany()
               .HasForeignKey(t => t.ProjectId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.ApprovedByUser)
               .WithMany()
               .HasForeignKey(t => t.ApprovedBy)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.Entries)
               .WithOne(e => e.Timesheet)
               .HasForeignKey(e => e.TimesheetId)
               .OnDelete(DeleteBehavior.Cascade);

        // Prevent duplicate timesheets for same employee + project + week
        builder.HasIndex(t => new { t.EmployeeId, t.ProjectId, t.WeekStartDate })
               .IsUnique();
    }
}
