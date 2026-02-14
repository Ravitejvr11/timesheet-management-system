using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Timesheet.Application.Auth.Interfaces;
using Timesheet.Application.Projects.Interfaces;
using Timesheet.Infrastructure.Persistence;
using Timesheet.Infrastructure.Services.Auth;
using Timesheet.Infrastructure.Services.Project;

namespace Timesheet.Infrastructure.DependencyInjection;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection")
            ));

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IProjectService, ProjectService>();

        return services;
    }
}
