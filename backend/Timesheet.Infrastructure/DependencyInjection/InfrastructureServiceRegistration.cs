using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Timesheet.Application.Abstractions.Auth;
using Timesheet.Infrastructure.Persistence;
using Timesheet.Infrastructure.Services.Auth;

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

        return services;
    }
}
