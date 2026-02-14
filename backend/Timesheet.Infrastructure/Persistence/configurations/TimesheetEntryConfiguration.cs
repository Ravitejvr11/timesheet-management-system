using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Timesheet.Domain.Entities;

namespace Timesheet.Infrastructure.Persistence.Configurations;

public class TimesheetEntryConfiguration 
    : IEntityTypeConfiguration<TimesheetEntry>
{
    public void Configure(EntityTypeBuilder<TimesheetEntry> builder)
    {
        builder.ToTable("TimesheetEntries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Id)
               .ValueGeneratedOnAdd();

        builder.Property(e => e.WorkDate)
               .IsRequired();

        builder.Property(e => e.BillableHours)
               .HasPrecision(5, 2)
               .IsRequired();

        builder.Property(e => e.NonBillableHours)
               .HasPrecision(5, 2)
               .IsRequired();

        builder.Property(e => e.Description)
               .HasMaxLength(1000);

        builder.HasOne(e => e.Timesheet)
               .WithMany(t => t.Entries)
               .HasForeignKey(e => e.TimesheetId)
               .OnDelete(DeleteBehavior.Cascade);

        // Prevent duplicate day entries inside same week
        builder.HasIndex(e => new { e.TimesheetId, e.WorkDate })
               .IsUnique();
    }
}
