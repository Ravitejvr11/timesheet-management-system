using Microsoft.EntityFrameworkCore;
using Timesheet.Infrastructure.Persistence;

namespace Timesheet.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
        
    }
    // Todo -> DbSets
}