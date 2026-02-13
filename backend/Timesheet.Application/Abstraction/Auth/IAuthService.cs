using Timesheet.Application.DTOs.Auth;

namespace Timesheet.Application.Abstractions.Auth;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
}
